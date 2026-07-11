import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type {
  RES_Asistencia,
  RES_ConfirmarAsistencia,
  RES_PlanillaEmpleado,
  RES_ResolverQR,
} from "./asistencia.responses";
import type {
  DTO_CancelarProceso,
  DTO_ConfirmarAsistencia,
  DTO_FiltrosAsistencia,
  DTO_MarcajeManual,
  DTO_ResolverQR,
} from "./asistencia.requests";

/**
 * Servicio HTTP del módulo Asistencia.
 *
 * Cubre dos conjuntos de endpoints:
 *  - Admin (`auth.jwt.custom`): listado, cálculo de planilla, marcaje manual.
 *  - Público (`/asistencia-public/*`): flujo /marcar-asistencia por QR.
 */
export const AsistenciaService = {
  // ========== ADMIN ==========

  get_asistencias: async (
    filtros: Partial<DTO_FiltrosAsistencia> = {},
  ): Promise<IRespuesta<RES_Asistencia[]>> => {
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

  get_asistencia_by_id: async (
    idAsistencia: number,
  ): Promise<IRespuesta<RES_Asistencia>> => {
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

  registrar_marcaje_manual: async (
    dto: DTO_MarcajeManual,
  ): Promise<IRespuesta<{ id_marcaje: number }>> => {
    const payload = {
      id_empleado: dto.id_empleado,
      fecha_hora: dto.fecha_hora,
      tipo_marcaje: dto.tipo_marcaje,
      id_programacion_horario: dto.id_programacion_horario ?? null,
      observaciones: dto.observaciones ?? null,
    };
    const { data } = await api.post("/asistencia/marcaje-manual", payload);
    return data;
  },

  // ========== PÚBLICO (/marcar-asistencia) ==========

  resolver_qr: async (
    dto: DTO_ResolverQR,
  ): Promise<IRespuesta<RES_ResolverQR>> => {
    const payload = {
      qr_token: dto.qr_token,
      evidencia_inicial: dto.evidencia_inicial ?? null,
    };
    const { data } = await api.post("/asistencia-public/resolver-qr", payload);
    return data;
  },

  confirmar_asistencia: async (
    dto: DTO_ConfirmarAsistencia,
  ): Promise<IRespuesta<RES_ConfirmarAsistencia>> => {
    const payload = {
      id_sesion: dto.id_sesion ?? null,
      id_empleado: dto.id_empleado,
      evidencia_rostro: dto.evidencia_rostro ?? null,
      evidencia_qr: dto.evidencia_qr ?? null,
    };
    const { data } = await api.post(
      "/asistencia-public/confirmar-asistencia",
      payload,
    );
    return data;
  },

  cancelar_proceso: async (
    dto: DTO_CancelarProceso,
  ): Promise<IRespuesta<{ id_marcaje: number; id_sesion: string | null } | null>> => {
    const payload = {
      id_empleado: dto.id_empleado,
      llego_al_qr: dto.llego_al_qr ?? true,
      id_sesion: dto.id_sesion ?? null,
      motivo: dto.motivo ?? null,
      evidencia_qr: dto.evidencia_qr ?? null,
    };
    const { data } = await api.post("/asistencia-public/cancelar-proceso", payload);
    return data;
  },
};