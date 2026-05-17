import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { RES_ControlConsumo } from "./control-consumo.responses";

const path = "/control-consumo";

export const ControlConsumoService = {
  /**
   * Obtener el listado de logs de uso con filtros.
   */
  getReporte: async (id_activo_fijo: number, mes: number, yearcito: number) => {
    const { data } = await api.get<IRespuesta<RES_ControlConsumo[]>>(path, {
      params: {
        id_activo_fijo,
        mes,
        yearcito,
      },
    });
    return data;
  },
};
