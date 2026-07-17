import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { RES_PlanillaAsistencia, RES_PlanillaEmpleado } from "./planilla.responses";
import type { DTO_FiltrosPlanilla } from "./planilla.requests";

/**
 * Servicio HTTP del módulo Planilla.
 */
export const PlanillaService = {
  get_planilla_asistencias: async (
    filtros: Partial<DTO_FiltrosPlanilla> = {},
  ): Promise<IRespuesta<RES_PlanillaAsistencia[]>> => {
    const params: Record<string, unknown> = {};
    const f = filtros as Record<string, unknown>;
    if (f.mes != null) params.mes = f.mes;
    if (f.year != null) params.year = f.year;
    if (f.id_empleado != null) params.id_empleado = f.id_empleado;
    if (f.id_almacen != null) params.id_almacen = f.id_almacen;
    if (f.id_labor != null) params.id_labor = f.id_labor;
    if (f.id_lugar != null) params.id_lugar = f.id_lugar;
    if (f.tipo_lugar != null) params.tipo_lugar = f.tipo_lugar;
    if (f.q != null) params.q = f.q;

    const { data } = await api.get("/asistencia", { params });
    return data;
  },

  get_planilla_asistencia_by_id: async (
    idAsistencia: number,
  ): Promise<IRespuesta<RES_PlanillaAsistencia>> => {
    const { data } = await api.get(`/asistencia/${idAsistencia}`);
    return data;
  },

  calcular_planilla: async (
    mes: number,
    year: number,
    idEmpleado?: number | null,
  ): Promise<IRespuesta<RES_PlanillaEmpleado[]>> => {
    const params: Record<string, unknown> = { mes, year };
    if (idEmpleado != null) params.id_empleado = idEmpleado;

    const { data } = await api.get("/asistencia/calcular-planilla", { params });
    return data;
  },
};
