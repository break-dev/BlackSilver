import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { PlanillaService } from "../service/planilla.service";
import type {
  RES_PlanillaAsistencia,
  PlanillaTramoAsistencia,
} from "../service/planilla.responses";
import type { useFiltrosPlanilla } from "./useFiltrosPlanilla";
import { useNotify } from "../../../hooks/useNotify";
import { useAuditoriaStore } from "../../../stores/auditoria.store";

type FiltrosHook = ReturnType<typeof useFiltrosPlanilla>;

/**
 * Segmento de sueldo detectado para un empleado dentro del mes filtrado.
 * Se genera a partir de los snapshots de cada asistencia (programacion_tipo_contrato,
 * programacion_sueldo_base, programacion_sueldo_diario).
 */
export interface PlanillaTramo {
  /** Clave estable para distinguir tramos del mismo día con sueldos distintos. */
  clave?: string;
  fecha_desde: string;
  fecha_hasta: string;
  tipo_contrato: string;
  sueldo_base: number | null;
  sueldo_real: number | null;
  salario_diario: number | null;
  dias: number;
  pago_tramo: number;
  pago_tramo_real: number;
}

/**
 * Hook para obtener la planilla de empleados agrupada.
 */
export const usePlanilla = (filtros: FiltrosHook) => {
  const { notifyError } = useNotify();
  const { en_modo_auditable } = useAuditoriaStore();
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

  const asistenciasFiltradas = useMemo(() => {
    if (!en_modo_auditable) return asistencias;
    return asistencias.filter((a) => {
      const tipo = a.programacion_tipo_contrato || a.tipo_contrato;
      return tipo === "Planilla" || tipo === "PeriodoPrueba";
    });
  }, [asistencias, en_modo_auditable]);

  const planillaPorEmpleado = agruparPorEmpleado(asistenciasFiltradas);

  return {
    asistencias: asistenciasFiltradas,
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
      sueldo_real: number | null;
      salario_diario: number | null;
      cargo_nombre?: string | null;
      area_nombre?: string | null;
      es_contratista?: boolean | number;
      mina_nombre?: string | null;
      dias_trabajados: number;
      pago_total: number;
      pago_total_real: number;
      tramos: PlanillaTramo[];
      marcaciones: RES_PlanillaAsistencia[];
    }
  >();

  for (const a of asistencias) {
    if (!mapa.has(a.id_empleado)) {
      const sBase = a.programacion_sueldo_base ?? a.sueldo_base ?? null;
      const sReal = a.programacion_sueldo_real ?? a.sueldo_real ?? sBase;
      mapa.set(a.id_empleado, {
        id_empleado: a.id_empleado,
        empleado: `${a.nombre ?? ""} ${a.apellido ?? ""}`.trim(),
        dni: a.dni,
        url_foto: a.url_foto,
        tipo_contrato: a.programacion_tipo_contrato ?? a.tipo_contrato,
        sueldo_base: sBase,
        sueldo_real: sReal,
        salario_diario: a.programacion_sueldo_diario ?? a.salario_diario,
        cargo_nombre: a.cargo_nombre,
        area_nombre: a.area_nombre,
        es_contratista: a.es_contratista,
        mina_nombre: a.mina_nombre,
        dias_trabajados: 0,
        pago_total: 0,
        pago_total_real: 0,
        tramos: [],
        marcaciones: [],
      });
    }
    const slot = mapa.get(a.id_empleado)!;
    slot.marcaciones.push(a);

    const jornada = Number(a.jornada_trabajada ?? 0);
    const tipo = a.programacion_tipo_contrato ?? a.tipo_contrato;
    const sueldoBaseEf = a.programacion_sueldo_base ?? a.sueldo_base ?? 0;
    const sueldoRealEf = a.programacion_sueldo_real ?? a.sueldo_real ?? sueldoBaseEf;

    if (Array.isArray(a.tramos_pago) && a.tramos_pago.length > 1) {
      const pagoTramo = a.tramos_pago.reduce(
        (acc: number, t: PlanillaTramoAsistencia) => acc + Number(t.pago ?? 0),
        0,
      );
      slot.pago_total += pagoTramo;
      // Pago real para tramos múltiples
      if (tipo === "Planilla" || tipo === "PeriodoPrueba") {
        const pagoTramoReal = a.tramos_pago.reduce((acc: number, t: PlanillaTramoAsistencia) => {
          const tSueldoBase = t.sueldo_base ?? sueldoBaseEf;
          const ratio = tSueldoBase > 0 ? sueldoRealEf / tSueldoBase : 1;
          return acc + Number(t.pago ?? 0) * ratio;
        }, 0);
        slot.pago_total_real += pagoTramoReal;
      } else {
        slot.pago_total_real += pagoTramo;
      }
    } else {
      const pagoBase = Number(a.pago_dia ?? 0);
      slot.pago_total += pagoBase;
      if (tipo === "Planilla" || tipo === "PeriodoPrueba") {
        const tasaDiariaReal = sueldoRealEf / 30;
        slot.pago_total_real += Math.round(jornada * tasaDiariaReal * 100) / 100;
      } else {
        slot.pago_total_real += pagoBase;
      }
    }

    if (jornada > 0) {
      slot.dias_trabajados += 1;
    }
  }

  // Calculamos tramos (segmentos de sueldo) por empleado, detectando cambios
  // de tipo_contrato o monto entre días consecutivos del mes.
  for (const slot of mapa.values()) {
    slot.tramos = calcularTramos(slot.marcaciones);
  }

  return Array.from(mapa.values())
    .map((e) => {
      const jornadaCalculada = Math.round(
        e.marcaciones.reduce(
          (acc, a) => acc + Number(a.jornada_trabajada ?? 0),
          0,
        ) * 100,
      ) / 100;

      return {
        ...e,
        jornada_total: jornadaCalculada,
        pago_total: Math.round(e.pago_total * 100) / 100,
        pago_total_real: Math.round(e.pago_total_real * 100) / 100,
        marcaciones: e.marcaciones.sort((x, y) =>
          (x.fecha ?? "").localeCompare(y.fecha ?? ""),
        ),
      };
    })
    .sort((a, b) => a.empleado.localeCompare(b.empleado));
}

/**
 * Genera la lista de tramos (segmentos de sueldo) a partir de las marcaciones
 * del empleado en el mes. Cada tramo es un período continuo con el mismo
 * snapshot de tipo_contrato/sueldo_base/salario_diario.
 *
 * Si en el mes hubo un cambio de sueldo (adenda), aparecerán 2+ tramos.
 * Si el sueldo fue estable durante todo el mes, aparecerá 1 solo tramo.
 *
 * Si la asistencia expone `tramos_pago[]` con varios tramos de sueldo distinto
 * en el mismo día (jornada mixta), cada sub-tramo se acumula con su propia
 * clave de tramo (concatenando `id_programacion_horario` al nombre).
 */
function calcularTramos(marcaciones: RES_PlanillaAsistencia[]): PlanillaTramo[] {
  const ordenadas = [...marcaciones].sort((a, b) =>
    (a.fecha ?? "").localeCompare(b.fecha ?? ""),
  );

  const tramos: PlanillaTramo[] = [];
  for (const a of ordenadas) {
    const fecha = a.fecha;
    if (!fecha) continue;

    // Jornada mixta: el backend devolvió varios tramos en el mismo día.
    if (Array.isArray(a.tramos_pago) && a.tramos_pago.length > 1) {
      for (const sub of a.tramos_pago) {
        const tipo = sub.tipo_contrato ?? null;
        const sueldo = sub.sueldo_base ?? null;
        const sueldoReal = a.programacion_sueldo_real ?? a.sueldo_real ?? sueldo;
        const salario = sub.sueldo_diario ?? null;
        const pago = Number(sub.pago ?? 0);
        const ratio = (sueldo && sueldo > 0) ? (sueldoReal ?? sueldo) / sueldo : 1;
        const pagoReal = (tipo === "Planilla" || tipo === "PeriodoPrueba") ? pago * ratio : pago;
        const clave = `${a.id_programacion_horario ?? "0"}-${sub.id_programacion_horario}`;

        const ultimo = tramos[tramos.length - 1];
        if (
          ultimo &&
          ultimo.tipo_contrato === tipo &&
          ultimo.sueldo_base === sueldo &&
          ultimo.sueldo_real === sueldoReal &&
          ultimo.salario_diario === salario &&
          ultimo.clave === clave
        ) {
          ultimo.fecha_hasta = fecha;
          ultimo.dias += 1;
          ultimo.pago_tramo += pago;
          ultimo.pago_tramo_real += pagoReal;
        } else {
          tramos.push({
            clave,
            fecha_desde: fecha,
            fecha_hasta: fecha,
            tipo_contrato: tipo ?? "—",
            sueldo_base: sueldo,
            sueldo_real: sueldoReal,
            salario_diario: salario,
            dias: 1,
            pago_tramo: pago,
            pago_tramo_real: pagoReal,
          });
        }
      }
      continue;
    }

    const tipo = (a.programacion_tipo_contrato ?? a.tipo_contrato) ?? null;
    const sueldo = a.programacion_sueldo_base ?? a.sueldo_base ?? null;
    const sueldoReal = a.programacion_sueldo_real ?? a.sueldo_real ?? sueldo;
    const salario = a.programacion_sueldo_diario ?? a.salario_diario ?? null;
    const jornada = Number(a.jornada_trabajada ?? 0);
    const pago = Number(a.pago_dia ?? 0);
    const pagoReal = (tipo === "Planilla" || tipo === "PeriodoPrueba")
      ? Math.round(jornada * ((sueldoReal ?? 0) / 30) * 100) / 100
      : pago;

    const ultimo = tramos[tramos.length - 1];
    if (
      ultimo &&
      ultimo.tipo_contrato === tipo &&
      ultimo.sueldo_base === sueldo &&
      ultimo.sueldo_real === sueldoReal &&
      ultimo.salario_diario === salario
    ) {
      ultimo.fecha_hasta = fecha;
      ultimo.dias += 1;
      ultimo.pago_tramo += pago;
      ultimo.pago_tramo_real += pagoReal;
    } else {
      tramos.push({
        fecha_desde: fecha,
        fecha_hasta: fecha,
        tipo_contrato: tipo ?? "—",
        sueldo_base: sueldo,
        sueldo_real: sueldoReal,
        salario_diario: salario,
        dias: 1,
        pago_tramo: pago,
        pago_tramo_real: pagoReal,
      });
    }
  }

  return tramos.map((t) => ({
    ...t,
    pago_tramo: Math.round(t.pago_tramo * 100) / 100,
    pago_tramo_real: Math.round(t.pago_tramo_real * 100) / 100,
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
  const esSueldoMensual =
    tramo.tipo_contrato === "Planilla" ||
    tramo.tipo_contrato === "PeriodoPrueba";

  if (esSueldoMensual && tramo.sueldo_base !== null) {
    monto = `S/. ${Number(tramo.sueldo_base).toFixed(2)}`;
  } else if (tramo.tipo_contrato === "JornadaDiaria" && tramo.salario_diario !== null) {
    monto = `S/. ${Number(tramo.salario_diario).toFixed(2)}/día`;
  }
  const tipoLabel =
    tramo.tipo_contrato === "PeriodoPrueba"
      ? "Periodo de Prueba"
      : tramo.tipo_contrato === "Planilla"
        ? "Planilla"
        : tramo.tipo_contrato === "JornadaDiaria"
          ? "Jornada Diaria"
          : tramo.tipo_contrato;
  return `${desde} - ${hasta}: ${tipoLabel} ${monto} (${dias})`;
};
