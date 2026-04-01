import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";
import type {
  RES_SolicitudReabastecimiento,
  RES_SolicitudDetalle,
  RES_TrazabilidadEvento,
  RES_DataRegistroSolicitud,
  RES_EntregaReabastecimiento,
  RES_LoteRecepcion,
  RecepcionEvento,
} from "./reabastecimiento.responses";
import type { DTO_CrearSolicitud, DTO_RecibirEntregas } from "./reabastecimiento.requests";

const path = "/solicitudes-reabastecimiento";

export const ReabastecimientoService = {
  listar: async (filters: { 
    id_almacen_solicitante?: number; 
    mes: string; 
    yearcito: string 
  }) => {
    const res = await api.get<IRespuesta<RES_SolicitudReabastecimiento[]>>(path, {
      params: filters,
    });
    return res.data;
  },

  crear: async (dto: DTO_CrearSolicitud) => {
    const res = await api.post<IRespuesta<RES_SolicitudReabastecimiento>>(
      path,
      dto,
    );
    return res.data;
  },

  obtenerDetalles: async (idSolicitud: number) => {
    const res = await api.get<IRespuesta<RES_SolicitudDetalle[]>>(
      `${path}/detalles-solicitud`,
      {
        params: { id_solicitud_reabastecimiento: idSolicitud },
      },
    );
    return res.data;
  },

  obtenerTrazabilidad: async (idDetalle: number) => {
    const res = await api.get<IRespuesta<RES_TrazabilidadEvento[]>>(
      `${path}/trazabilidad-detalle`,
      {
        params: { id_solicitud_detalle: idDetalle },
      },
    );
    return res.data;
  },

  obtenerCatalogos: async () => {
    const res = await api.get<IRespuesta<RES_DataRegistroSolicitud>>(
      `${path}/catalogos`,
    );
    return res.data;
  },

  obtenerHistorialEntregas: async (idSolicitud: number) => {
    const res = await api.get<IRespuesta<RES_EntregaReabastecimiento[]>>(
      `${path}/historial-entregas`,
      {
        params: { id_solicitud_reabastecimiento: idSolicitud },
      },
    );
    return res.data;
  },

  obtenerEntregasPrestamo: async (idSolicitud: number) => {
    const res = await api.get<IRespuesta<RES_EntregaReabastecimiento[]>>(
      "/prestamos-atencion/entregas-solicitud",
      {
        params: { id_solicitud: idSolicitud },
      },
    );
    return res.data;
  },

  /**
   * Obtiene los lotes disponibles en el almacen destino para una entrega
   */
  getLotesDestino: async (idAlmacenSolicitante: number, idProductos: number[]) => {
    const res = await api.get<IRespuesta<RES_LoteRecepcion[]>>(
      `${path}/catalogos/lotes-destino`,
      {
        params: { 
          id_almacen_solicitante: idAlmacenSolicitante,
          id_productos: idProductos
        },
      },
    );
    return res.data;
  },

  recibirEntregas: async (data: DTO_RecibirEntregas) => {
    const res = await api.post<IRespuesta<null>>(
      `${path}/recibir-entrega-item`,
      data
    );
    return res.data;
  },

  recibirEntregaBulk: async (data: Record<string, unknown>) => {
    const res = await api.post<IRespuesta<null>>(
      `${path}/recibir-entrega-bulk`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return res.data;
  },

  getHistorialRecepcionesEntrega: async (idEntrega: number) => {
    const res = await api.get<IRespuesta<RecepcionEvento[]>>(
      `${path}/historial-recepciones-entrega`,
      {
        params: { id_reabastecimiento_entrega: idEntrega },
      },
    );
    return res.data;
  },
};
