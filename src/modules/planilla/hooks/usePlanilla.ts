import { useCallback, useEffect, useState } from "react";
import { PlanillaService } from "../service/planilla.service";
import type { RES_PlanillaAsistencia } from "../service/planilla.responses";
import type { useFiltrosPlanilla } from "./useFiltrosPlanilla";
import { useNotify } from "../../../hooks/useNotify";

type FiltrosHook = ReturnType<typeof useFiltrosPlanilla>;

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

  return Array.from(mapa.values()).map((e) => ({
    ...e,
    jornada_total: Math.round(e.jornada_total * 10000) / 10000,
    pago_total: Math.round(e.pago_total * 100) / 100,
    marcaciones: e.marcaciones.sort((x, y) =>
      (x.fecha ?? "").localeCompare(y.fecha ?? ""),
    ),
  }));
}
