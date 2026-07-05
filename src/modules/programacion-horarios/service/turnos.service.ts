import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { RES_TurnoLaboral } from "./turnos.responses";
import type {
  DTO_ActualizarTurno,
  DTO_CambiarEstadoTurno,
  DTO_CrearTurno,
} from "./turnos.requests";

export const TurnoLaboralService = {
  get_turnos: async (
    estado?: string,
    tipo_turno?: string,
  ): Promise<IRespuesta<RES_TurnoLaboral[]>> => {
    const { data } = await api.get("/turnos-laborales", {
      params: { estado, tipo_turno },
    });
    return data;
  },

  get_turno_by_id: async (
    idTurno: number,
  ): Promise<IRespuesta<RES_TurnoLaboral>> => {
    const { data } = await api.get(`/turnos-laborales/${idTurno}`);
    return data;
  },

  crear_turno: async (
    dto: DTO_CrearTurno,
  ): Promise<IRespuesta<RES_TurnoLaboral>> => {
    const { data } = await api.post("/turnos-laborales", dto);
    return data;
  },

  actualizar_turno: async (
    idTurno: number,
    dto: DTO_ActualizarTurno,
  ): Promise<IRespuesta<RES_TurnoLaboral>> => {
    const { data } = await api.put(`/turnos-laborales/${idTurno}`, dto);
    return data;
  },

  cambiar_estado: async (
    idTurno: number,
    dto: DTO_CambiarEstadoTurno,
  ): Promise<IRespuesta<null>> => {
    const { data } = await api.post(
      `/turnos-laborales/${idTurno}/cambiar-estado`,
      dto,
    );
    return data;
  },
};