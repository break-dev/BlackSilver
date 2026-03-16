import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";
import type {
  RES_SolicitudReabastecimiento,
  RES_SolicitudDetalle,
  RES_TrazabilidadEvento,
  RES_DataRegistroSolicitud,
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
};
