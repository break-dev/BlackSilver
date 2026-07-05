import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type {
  RES_EmpleadoElegible,
  RES_ProgramacionAsignada,
  RES_ProgramacionHorario,
} from "./programacion.responses";
import type {
  DTO_AsignarHorario,
  DTO_CambiarEstadoProgramacion,
} from "./programacion.requests";

interface ProgramacionFiltros {
  id_empleado?: number;
  id_turno_laboral?: number;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export const ProgramacionHorarioService = {
  get_programaciones: async (
    filtros: ProgramacionFiltros = {},
  ): Promise<IRespuesta<RES_ProgramacionHorario[]>> => {
    const { data } = await api.get("/programacion-horario", { params: filtros });
    return data;
  },

  get_programacion_by_id: async (
    idProgramacion: number,
  ): Promise<IRespuesta<RES_ProgramacionHorario>> => {
    const { data } = await api.get(`/programacion-horario/${idProgramacion}`);
    return data;
  },

  get_grilla_semanal: async (
    fechaInicio: string,
    fechaFin: string,
  ): Promise<IRespuesta<RES_ProgramacionHorario[]>> => {
    const { data } = await api.get("/programacion-horario/grilla-semanal", {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
    });
    return data;
  },

  asignar_horario: async (
    dto: DTO_AsignarHorario,
  ): Promise<IRespuesta<RES_ProgramacionAsignada>> => {
    const payload = {
      id_turno_laboral: dto.id_turno_laboral,
      fecha_inicio: dto.fecha_inicio,
      por_tiempo_indefinido: dto.por_tiempo_indefinido ?? false,
      fecha_fin: dto.por_tiempo_indefinido ? null : dto.fecha_fin,
      dias_laborables: dto.dias_laborables,
      empleados: dto.empleados,
    };
    const { data } = await api.post("/programacion-horario/asignar", payload);
    return data;
  },

  cambiar_estado: async (
    idProgramacion: number,
    dto: DTO_CambiarEstadoProgramacion,
  ): Promise<IRespuesta<null>> => {
    const { data } = await api.post(
      `/programacion-horario/${idProgramacion}/cambiar-estado`,
      dto,
    );
    return data;
  },

  get_empleados_elegibles: async (
    fechaFinProgramacion: string | null,
  ): Promise<IRespuesta<RES_EmpleadoElegible[]>> => {
    const { data } = await api.get("/aux/empleados", {
      params: {
        solo_con_contrato_vigente: 1,
        fecha_fin_programacion: fechaFinProgramacion ?? undefined,
      },
    });
    return data;
  },
};