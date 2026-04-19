import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type {
  RES_HistorialEntregas,
  RES_StockTotalAlmacen,
} from "./solicitudes-atencion.responses";
import type {
  DTO_DecisionDetalle,
  DTO_RegistrarEntregaReabastecimiento,
  DTO_CrearPrestamo,
} from "./solicitudes-atencion.requests";
import type { RES_PersonalExterno } from "../../../service/responses/personal-externo";
import type { RES_LoteDisponible } from "../../../service/responses/lote-producto";
import type { RES_Almacen } from "../../../service/responses/almacen";
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
      formData.append("id_personal_recibe", dto.id_personal_recibe.toString());
      formData.append("fecha_hora_entrega", dto.fecha_hora_entrega);
      if (dto.observacion) formData.append("observacion", dto.observacion);

      dto.evidencias.forEach((file) => {
        formData.append("evidencias[]", file);
      });

      dto.detalles.forEach((detalle, index) => {
        Object.entries(detalle).forEach(([key, value]) => {
          formData.append(`detalles[${index}][${key}]`, String(value));
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

  obtenerAlmacenes: async (esPrincipal: boolean = false) => {
    const res = await api.get<IRespuesta<RES_Almacen[]>>(
      `${path}/auxiliares/almacenes`,
      {
        params: { es_principal: esPrincipal ? 1 : 0 },
      },
    );
    return res.data;
  },

  obtenerPersonalExterno: async () => {
    const res = await api.get<IRespuesta<RES_PersonalExterno[]>>(
      `${path}/auxiliares/personal-externo`,
    );
    return res.data;
  },

  crearPersonalExterno: async (dto: {
    nombre: string;
    apellido?: string;
    dni?: string;
  }) => {
    const res = await api.post<IRespuesta<RES_PersonalExterno>>(
      `${path}/auxiliares/personal-externo`,
      dto,
    );
    return res.data;
  },

  obtenerLotesDisponibles: async (
    idsProductos: number[],
    idAlmacen: number,
  ) => {
    const res = await api.get<IRespuesta<RES_LoteDisponible[]>>(
      `${path}/auxiliares/lotes`,
      {
        params: { ids_productos: idsProductos, id_almacen: idAlmacen },
      },
    );
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

    const resp = await api.get<IRespuesta<RES_Almacen[]>>(
      `${path}/prestamos/almacenes-con-stock?${params.toString()}`,
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
      `${path}/prestamos/stock-total-almacen`,
      {
        params: { id_almacen: idAlmacen, ids_productos: idsProductos },
      },
    );
    return res.data;
  },

  obtenerLotesDisponiblesPrestamo: async (
    idProducto: number,
    idAlmacen: number,
  ) => {
    const res = await api.get<IRespuesta<RES_LoteDisponible[]>>(
      `${path}/prestamos/lotes-disponibles`,
      {
        params: { id_producto: idProducto, id_almacen: idAlmacen },
      },
    );
    return res.data;
  },
};
