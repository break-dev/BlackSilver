import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { RES_ControlConsumo, RES_ConsumoDetalle } from "./control-consumo.responses";

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

  /**
   * Registrar un nuevo log de consumo de un producto entregado.
   */
  registrarConsumo: async (payload: {
    id_requerimiento_almacen_entrega_detalle: number;
    cantidad_base_consumida: number;
    fecha_hora_consumo: string;
    comentario_consumo?: string | null;
  }) => {
    const { data } = await api.post<IRespuesta<RES_ConsumoDetalle>>(
      `${path}/consumir`,
      payload,
    );
    return data;
  },
};
