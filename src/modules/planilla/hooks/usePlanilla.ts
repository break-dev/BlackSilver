import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { PlanillaService } from "../service/planilla.service";
import type { RES_PlanillaAsistencia } from "../service/planilla.responses";
import type { useFiltrosPlanilla } from "./useFiltrosPlanilla";
import { useNotify } from "../../../hooks/useNotify";

type FiltrosHook = ReturnType<typeof useFiltrosPlanilla>;

/**
 * Segmento de sueldo detectado para un empleado dentro del mes filtrado.
 * Se genera a partir de los snapshots de cada asistencia (programacion_tipo_contrato,
 * programacion_sueldo_base, programacion_sueldo_diario).
 */
export interface PlanillaTramo {
  fecha_desde: string;
  fecha_hasta: string;
  tipo_contrato: string;
  sueldo_base: number | null;
  salario_diario: number | null;
  dias: number;
  pago_tramo: number;
}

/**
 * Hook para obtener la planilla de empleados agrupada.
 */
export const usePlanilla = (filtros: FiltrosHook) => {
  const { notifyError } = useNotify();
  const [asistencias, setAsistencias] = useState<RES_PlanillaAsistencia[]>([]);
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async () => {
    if (!filtros.mes || !filtros.year) {
      setAsistencias([]);
      return;
    }

    setLoading(true);
    try {
      const resp = await PlanillaService.get_planilla_asistencias(filtros.filtrosPayload);
      if (resp.success) {
        setAsistencias(resp.data as RES_PlanillaAsistencia[]);
      }
    } catch (err) {
      console.error(err);
      notifyError("No se pudo cargar la planilla");
    } finally {
      setLoading(false);
    }
  }, [filtros.mes, filtros.year, filtros.filtrosPayload, notifyError]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const planillaPorEmpleado = agruparPorEmpleado(asistencias);

  return {
    asistencias,
    planillaPorEmpleado,
    loading,
    recargar: cargar,
  };
};

function agruparPorEmpleado(asistencias: RES_PlanillaAsistencia[]) {
  const mapa = new Map<
    number,
    {
      id_empleado: number;
      empleado: string;
      dni: string | null;
      url_foto: string | null;
      tipo_contrato: string | null;
      sueldo_base: number | null;
      salario_diario: number | null;
      cargo_nombre?: string | null;
      area_nombre?: string | null;
      dias_trabajados: number;
      jornada_total: number;
      pago_total: number;
      tramos: PlanillaTramo[];
      marcaciones: RES_PlanillaAsistencia[];
    }
  >();

  for (const a of asistencias) {
    if (!mapa.has(a.id_empleado)) {
      mapa.set(a.id_empleado, {
        id_empleado: a.id_empleado,
        empleado: `${a.nombre ?? ""} ${a.apellido ?? ""}`.trim(),
        dni: a.dni,
        url_foto: a.url_foto,
        tipo_contrato: a.tipo_contrato,
        sueldo_base: a.sueldo_base,
        salario_diario: a.salario_diario,
        cargo_nombre: a.cargo_nombre,
        area_nombre: a.area_nombre,
        dias_trabajados: 0,
        jornada_total: 0,
        pago_total: 0,
        tramos: [],
        marcaciones: [],
      });
    }
    const slot = mapa.get(a.id_empleado)!;
    slot.marcaciones.push(a);
    slot.jornada_total += Number(a.jornada_trabajada ?? 0);
    slot.pago_total += Number(a.pago_dia ?? 0);
    if (Number(a.jornada_trabajada ?? 0) > 0) {
      slot.dias_trabajados += 1;
    }
  }

  // Calculamos tramos (segmentos de sueldo) por empleado, detectando cambios
  // de tipo_contrato o monto entre días consecutivos del mes.
  for (const slot of mapa.values()) {
    slot.tramos = calcularTramos(slot.marcaciones);
  }

  return Array.from(mapa.values())
    .map((e) => ({
      ...e,
      jornada_total: Math.round(e.jornada_total * 10000) / 10000,
      pago_total: Math.round(e.pago_total * 100) / 100,
      marcaciones: e.marcaciones.sort((x, y) =>
        (x.fecha ?? "").localeCompare(y.fecha ?? ""),
      ),
    }))
    .sort((a, b) => a.empleado.localeCompare(b.empleado));
}

/**
 * Genera la lista de tramos (segmentos de sueldo) a partir de las marcaciones
 * del empleado en el mes. Cada tramo es un período continuo con el mismo
 * snapshot de tipo_contrato/sueldo_base/salario_diario.
 *
 * Si en el mes hubo un cambio de sueldo (adenda), aparecerán 2+ tramos.
 * Si el sueldo fue estable durante todo el mes, aparecerá 1 solo tramo.
 */
function calcularTramos(marcaciones: RES_PlanillaAsistencia[]): PlanillaTramo[] {
  const ordenadas = [...marcaciones].sort((a, b) =>
    (a.fecha ?? "").localeCompare(b.fecha ?? ""),
  );

  const tramos: PlanillaTramo[] = [];
  for (const a of ordenadas) {
    const fecha = a.fecha;
    if (!fecha) continue;

    const tipo = (a.programacion_tipo_contrato ?? a.tipo_contrato) ?? null;
    const sueldo = a.programacion_sueldo_base ?? a.sueldo_base ?? null;
    const salario = a.programacion_sueldo_diario ?? a.salario_diario ?? null;
    const pago = Number(a.pago_dia ?? 0);

    const ultimo = tramos[tramos.length - 1];
    if (
      ultimo &&
      ultimo.tipo_contrato === tipo &&
      ultimo.sueldo_base === sueldo &&
      ultimo.salario_diario === salario
    ) {
      ultimo.fecha_hasta = fecha;
      ultimo.dias += 1;
      ultimo.pago_tramo += pago;
    } else {
      tramos.push({
        fecha_desde: fecha,
        fecha_hasta: fecha,
        tipo_contrato: tipo ?? "—",
        sueldo_base: sueldo,
        salario_diario: salario,
        dias: 1,
        pago_tramo: pago,
      });
    }
  }

  return tramos.map((t) => ({
    ...t,
    pago_tramo: Math.round(t.pago_tramo * 100) / 100,
  }));
}

/**
 * Formatea un tramo del mes en texto legible para tooltip.
 * Ej: "01/07 - 15/07: Planilla S/1,500.00 (días: 12)"
 */
export const formatearTramo = (tramo: PlanillaTramo): string => {
  const desde = dayjs(tramo.fecha_desde).format("DD/MM");
  const hasta = dayjs(tramo.fecha_hasta).format("DD/MM");
  const dias = tramo.dias === 1 ? "1 día" : `${tramo.dias} días`;
  let monto = "—";
  if (tramo.tipo_contrato === "Planilla" && tramo.sueldo_base !== null) {
    monto = `S/. ${tramo.sueldo_base.toFixed(2)}`;
  } else if (tramo.tipo_contrato === "JornadaDiaria" && tramo.salario_diario !== null) {
    monto = `S/. ${tramo.salario_diario.toFixed(2)}/día`;
  }
  return `${desde} - ${hasta}: ${tramo.tipo_contrato} ${monto} (${dias})`;
};
