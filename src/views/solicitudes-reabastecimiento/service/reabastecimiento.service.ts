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
import type { DTO_CrearSolicitud, DTO_RecibirEntregas, DTO_RecibirEntregaItem } from "./reabastecimiento.requests";

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
      `${path}/entregas`,
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

  recibirEntregaBulk: async (payload: {
    recepciones: Array<{
      id_reabastecimiento_entrega: number;
      tipo_entrega: string;
      items: DTO_RecibirEntregaItem[];
      con_incidencia: boolean;
      observacion: string;
      fecha_hora_recepcion: string;
    }>;
    id_empleado_registro: number;
    evidencias: File[];
  }) => {
    const formData = new FormData();

    // Campo raíz: empleado
    formData.append("id_empleado_registro", payload.id_empleado_registro.toString());

    // Evidencias al nivel raíz (mismo patrón que PrestamosAtencion)
    payload.evidencias.forEach((file) => {
      formData.append("evidencias[]", file);
    });

    // Recepciones con sus items anidados
    payload.recepciones.forEach((rec, rIdx) => {
      formData.append(`recepciones[${rIdx}][id_reabastecimiento_entrega]`, rec.id_reabastecimiento_entrega.toString());
      formData.append(`recepciones[${rIdx}][tipo_entrega]`, rec.tipo_entrega);
      formData.append(`recepciones[${rIdx}][con_incidencia]`, rec.con_incidencia ? "1" : "0");
      formData.append(`recepciones[${rIdx}][observacion]`, rec.observacion ?? "");
      formData.append(`recepciones[${rIdx}][fecha_hora_recepcion]`, rec.fecha_hora_recepcion);

      rec.items.forEach((item, iIdx) => {
        Object.entries(item).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(`recepciones[${rIdx}][items][${iIdx}][${key}]`, String(value));
          }
        });
      });
    });

    const res = await api.post<IRespuesta<null>>(
      `${path}/recibir-entrega-bulk`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data;
  },

  getHistorialRecepcionesEntrega: async (idEntrega: number, tipoEntrega: string = 'Solicitud') => {
    const res = await api.get<IRespuesta<RecepcionEvento[]>>(
      `${path}/historial-recepciones-entrega`,
      {
        params: { id_reabastecimiento_entrega: idEntrega, tipo_entrega: tipoEntrega },
      },
    );
    return res.data;
  },
};
