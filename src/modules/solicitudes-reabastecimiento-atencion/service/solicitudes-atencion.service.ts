import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type {
  RES_AlmacenVecino,
  RES_HistorialEntregas,
  RES_StockTotalAlmacen,
} from "./solicitudes-atencion.responses";
import type {
  DTO_DecisionDetalle,
  DTO_RegistrarEntregaReabastecimiento,
  DTO_CrearPrestamo,
} from "./solicitudes-atencion.requests";
import type {
  RES_Solicitud,
  RES_SolicitudDetalle,
} from "../../../service/responses/solicitudes-reabastecimiento/solicitud";
import type { RES_Trazabilidad } from "../../../service/responses/_generic/trazabilidad";
import type { RES_Prestamo } from "../../../service/responses/prestamos/prestamo";

const path = "/solicitudes-atencion";

export const SolicitudesAtencionService = {
  obtenerSolicitudes: async (
    idAlmacen: number,
    mes: string,
    yearcito: string,
  ) => {
    const res = await api.get<IRespuesta<RES_Solicitud[]>>(`${path}`, {
      params: { id_almacen: idAlmacen, mes, yearcito },
    });
    return res.data;
  },

  obtenerDetallesSolicitud: async (idSolicitud: number) => {
    const res = await api.get<IRespuesta<RES_SolicitudDetalle[]>>(
      `${path}/detalles-by-solicitud`,
      {
        params: { id_solicitud: idSolicitud },
      },
    );
    return res.data;
  },

  guardarDecisionDetalle: async (dto: DTO_DecisionDetalle) => {
    const res = await api.put<IRespuesta<null>>(
      `${path}/save-decision-detalle`,
      dto,
    );
    return res.data;
  },

  obtenerTrazabilidad: async (idDetalle: number) => {
    const res = await api.get<IRespuesta<RES_Trazabilidad[]>>(
      `${path}/trazabilidad`,
      {
        params: { id_solicitud_detalle: idDetalle },
      },
    );
    return res.data;
  },

  obtenerHistorialEntregas: async (idSolicitud: number) => {
    const res = await api.get<IRespuesta<RES_HistorialEntregas>>(
      `${path}/entregas`,
      {
        params: { id_solicitud: idSolicitud },
      },
    );
    return res.data;
  },

  registrarEntrega: async (dto: DTO_RegistrarEntregaReabastecimiento) => {
    if (dto.evidencias && dto.evidencias.length > 0) {
      const formData = new FormData();
      formData.append("id_solicitud", dto.id_solicitud.toString());
      formData.append("id_almacen_entrega", dto.id_almacen_entrega.toString());
      if (dto.id_empleado_recibe) {
        formData.append("id_empleado_recibe", dto.id_empleado_recibe.toString());
      }
      formData.append("fecha_hora_entrega", dto.fecha_hora_entrega);
      if (dto.observacion) formData.append("observacion", dto.observacion);

      // Transport fields
      formData.append("medio_entrega", dto.medio_entrega);
      if (dto.id_proveedor_transporte) {
        formData.append("id_proveedor_transporte", dto.id_proveedor_transporte.toString());
      }
      if (dto.id_agencia_transporte) {
        formData.append("id_agencia_transporte", dto.id_agencia_transporte.toString());
      }
      if (dto.numero_factura) formData.append("numero_factura", dto.numero_factura);
      if (dto.serie_factura) formData.append("serie_factura", dto.serie_factura);
      if (dto.serie_guia_transportista) formData.append("serie_guia_transportista", dto.serie_guia_transportista);
      if (dto.numero_guia_transportista) formData.append("numero_guia_transportista", dto.numero_guia_transportista);
      if (dto.serie_guia_remitente) formData.append("serie_guia_remitente", dto.serie_guia_remitente);
      if (dto.numero_guia_remitente) formData.append("numero_guia_remitente", dto.numero_guia_remitente);
      if (dto.costo_envio !== undefined && dto.costo_envio !== null) {
        formData.append("costo_envio", dto.costo_envio.toString());
      }

      dto.evidencias.forEach((file) => {
        formData.append("evidencias[]", file);
      });

      dto.detalles.forEach((detalle, index) => {
        Object.entries(detalle).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(`detalles[${index}][${key}]`, String(value));
          }
        });
      });

      const res = await api.post<IRespuesta<string>>(
        `${path}/entregas`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return res.data;
    }

    const res = await api.post<IRespuesta<string>>(`${path}/entregas`, dto);
    return res.data;
  },

  /* --- PRÉSTAMOS --- */
  obtenerPrestamosPorSolicitud: async (idSolicitud: number) => {
    const res = await api.get<IRespuesta<RES_Prestamo[]>>(
      `${path}/prestamos/por-solicitud`,
      {
        params: { id_solicitud: idSolicitud },
      },
    );
    return res.data;
  },

  crearPrestamo: async (dto: DTO_CrearPrestamo) => {
    const res = await api.post<IRespuesta<RES_Prestamo>>(
      `${path}/prestamos/nuevo`,
      dto,
    );
    return res.data;
  },

  getAlmacenesConStock: async (
    ids_productos: number[],
    id_almacen_excluido: number,
  ) => {
    const params = new URLSearchParams();
    ids_productos.forEach((id) =>
      params.append("ids_productos[]", id.toString()),
    );
    params.append("id_almacen_excluido", id_almacen_excluido.toString());

    const resp = await api.get<IRespuesta<RES_AlmacenVecino[]>>(
      `${path}/aux/almacenes-con-stock?${params.toString()}`,
    );
    return resp.data;
  },

  obtenerStockTotalAlmacenPorProductos: async (
    idAlmacen: number,
    idsProductos: number[],
  ) => {
    const params = new URLSearchParams();
    idsProductos.forEach((id) =>
      params.append("ids_productos[]", id.toString()),
    );
    params.append("id_almacen", idAlmacen.toString());

    const res = await api.get<IRespuesta<RES_StockTotalAlmacen[]>>(
      `${path}/aux/stock-total-almacen`,
      {
        params: { id_almacen: idAlmacen, ids_productos: idsProductos },
      },
    );
    return res.data;
  },
};
