import { api } from "../../../service/_api";
import type { RES_Trazabilidad } from "../../../service/responses/_generic/trazabilidad";
import type {
  RES_OrdenCompra,
  RES_OrdenCompraDetalle,
} from "../../../service/responses/ordenes-compra/orden-compra";
import type { IRespuesta } from "../../../shared/interfaces/_response";

const path = "/ordenes-compra";

export const OrdenCompraService = {
  /**
   * Obtener todas las órdenes de compra
   */
  get_ordenes: async (params?: {
    mes?: string;
    year?: string;
  }): Promise<IRespuesta<RES_OrdenCompra[]>> => {
    const query = new URLSearchParams(params).toString();

    const { data } = await api.get<IRespuesta<RES_OrdenCompra[]>>(
      `${path}?${query}`,
    );

    return data;
  },

  /**
   * Obtener los detalles de una OC específica
   */
  get_detalles: async (
    id_orden_compra: number,
  ): Promise<IRespuesta<RES_OrdenCompraDetalle[]>> => {
    const { data } = await api.get<IRespuesta<RES_OrdenCompraDetalle[]>>(
      `${path}/detalles?id_orden_compra=${id_orden_compra}`,
    );
    return data;
  },

  /**
   * Obtener el seguimiento de un detalle de OC
   */
  get_seguimiento: async (
    id_detalle: number,
  ): Promise<IRespuesta<RES_Trazabilidad[]>> => {
    const { data } = await api.get<IRespuesta<RES_Trazabilidad[]>>(
      `${path}/seguimiento?id_detalle=${id_detalle}`,
    );
    return data;
  },
};
