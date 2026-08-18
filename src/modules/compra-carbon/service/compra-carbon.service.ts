import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { IArchivo } from "../../../shared/interfaces/archivo";
import type { CrearCompraCarbonRequest } from "./compra-carbon.requests";
import type {
  CompraCarbonDetalle,
  CompraCarbonResumen,
} from "./compra-carbon.responses";

const path = "/compras-carbon";

export const CompraCarbonService = {
  getCompras: async (filtros?: {
    filtros?: string;
    id_empresa?: number;
    id_proveedor?: number;
    mes?: number;
    anio?: number;
  }): Promise<IRespuesta<CompraCarbonResumen[]>> => {
    const { data } = await api.get<IRespuesta<CompraCarbonResumen[]>>(
      path,
      { params: filtros },
    );
    return data;
  },

  getCompraConDetalles: async (
    idCompraCarbon: number,
  ): Promise<IRespuesta<CompraCarbonDetalle>> => {
    const { data } = await api.get<IRespuesta<CompraCarbonDetalle>>(
      `${path}/${idCompraCarbon}`,
    );
    return data;
  },

  crearCompra: async (
    payload: CrearCompraCarbonRequest,
  ): Promise<IRespuesta<CompraCarbonDetalle>> => {
    const { data } = await api.post<IRespuesta<CompraCarbonDetalle>>(
      path,
      payload,
    );
    return data;
  },

  /**
   * Aprueba una compra de carbon. Setea fecha_hora_aprobacion e
   * id_empleado_aprueba en backend; cambia estado a Aprobado.
   */
  aprobar: async (
    idCompraCarbon: number,
  ): Promise<IRespuesta<CompraCarbonDetalle>> => {
    const { data } = await api.post<IRespuesta<CompraCarbonDetalle>>(
      `${path}/${idCompraCarbon}/aprobar`,
    );
    return data;
  },

  /**
   * Reemplaza las evidencias de aprobacion (JSON en backend).
   */
  setEvidenciasAprobacion: async (
    idCompraCarbon: number,
    evidencias: IArchivo[],
  ): Promise<IRespuesta<CompraCarbonDetalle>> => {
    const { data } = await api.post<IRespuesta<CompraCarbonDetalle>>(
      `${path}/${idCompraCarbon}/evidencias`,
      { evidencias },
    );
    return data;
  },

  /**
   * Anula una compra de carbon. Cambia el estado a Anulado.
   */
  anular: async (
    idCompraCarbon: number,
  ): Promise<IRespuesta<CompraCarbonDetalle>> => {
    const { data } = await api.post<IRespuesta<CompraCarbonDetalle>>(
      `${path}/${idCompraCarbon}/anular`,
    );
    return data;
  },
};