import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";
import type {
  RES_SolicitudReabastecimiento,
  RES_SolicitudDetalle,
  RES_TrazabilidadEvento,
  RES_DataRegistroSolicitud,
  RES_EntregaReabastecimiento,
  RES_LoteRecepcion,
  DTO_RecibirEntregas,
} from "./reabastecimiento.responses";
import type { DTO_CrearSolicitud } from "./reabastecimiento.requests";

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
    // We can use the same endpoint from atención as they share the context, or create one. Wait, in backend `SolicitudesReabastecimientoAtencion` has `trazabilidad-entregas`. Let's create `obtenerHistorialEntregas` in backend if it doesn't exist for the small warehouse, or we can just fetch from `solicitudes-reabastecimiento-atencion` since it's just reading data? No, architecture says isolate. I'll add the method `obtenerHistorialEntregas` in `SolicitudesController.php`. Wait, I didn't add it! I will have to add it to the backend. Let's document this in frontend first and I will go back to add it.
    const res = await api.get<IRespuesta<RES_EntregaReabastecimiento[]>>(
      `${path}/historial-entregas`,
      {
        params: { id_solicitud_reabastecimiento: idSolicitud },
      },
    );
    return res.data;
  },

  /**
   * Obtiene los lotes disponibles en el almacen destino para una entrega
   */
  getLotesDestino: async (idReabastecimientoEntrega: number) => {
    const res = await api.get<IRespuesta<RES_LoteRecepcion[]>>(
      `${path}/lotes-destino`,
      {
        params: { id_reabastecimiento_entrega: idReabastecimientoEntrega },
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
};
