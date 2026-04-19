import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type {
  RES_ListadoOrdenCompra,
  RES_OrdenCompraDetalle,
} from "./orden-compra.responses";

export const OrdenCompraService = {
  /**
   * Obtener todas las órdenes de compra
   */
  get_ordenes: async (): Promise<IRespuesta<RES_ListadoOrdenCompra>> => {
    const { data } = await api.get<IRespuesta<RES_ListadoOrdenCompra>>("/orden-compra");
    return data;
  },

  /**
   * Obtener los detalles de una OC específica
   */
  get_detalles: async (id_orden_compra: number): Promise<IRespuesta<{ detalles: RES_OrdenCompraDetalle[] }>> => {
    const { data } = await api.get<IRespuesta<{ detalles: RES_OrdenCompraDetalle[] }>>(
      `/orden-compra/detalles?id_orden_compra=${id_orden_compra}`
    );
    return data;
  },
};
