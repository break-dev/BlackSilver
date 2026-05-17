import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { REQ_RegistrarUso } from "./control-uso.requests";
import type {
  RES_ControlUsoLog,
  RES_UltimoHorometro,
} from "./control-uso.responses";

const path = "/control-uso";

export const ControlUsoService = {
  /**
   * Obtener el listado de logs de uso con filtros.
   */
  getLogs: async (filters?: {
    tipo_control?: "horometro" | "odometro";
    mes?: number;
    anio?: number;
  }) => {
    const { data } = await api.get<IRespuesta<RES_ControlUsoLog[]>>(path, {
      params: filters,
    });
    return data;
  },

  /**
   * Obtener la última lectura para un activo específico.
   */
  getUltimoHorometro: async (idActivoFijo: number) => {
    const { data } = await api.get<IRespuesta<RES_UltimoHorometro>>(
      `${path}/ultimo-horometro/${idActivoFijo}`,
    );
    return data;
  },

  /**
   * Registrar un nuevo log de uso de activo.
   */
  registrarUso: async (payload: REQ_RegistrarUso) => {
    const { data } = await api.post<IRespuesta<RES_ControlUsoLog>>(path, payload);
    return data;
  },
};
export default ControlUsoService;
