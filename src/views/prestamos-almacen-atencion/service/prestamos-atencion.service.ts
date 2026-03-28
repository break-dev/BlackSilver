import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";
import type {
  RES_AlmacenAutorizado,
  RES_PrestamoAtencion,
  RES_DetallePrestamoPorId,
  RES_LoteDisponibleDespacho,
  RES_EmpleadoPrestamo,
  RES_TrazabilidadPrestamo,
  RES_ReposicionPrestamo,
  RES_DetalleReposicionParaRecepcion,
  RES_LoteRecepcionReposicion,
  RES_UnidadMedida,
} from "./prestamos-atencion.responses";
import type {
  DTO_RegistrarEntrega,
  DTO_RecibirEntregaReposicionItem,
} from "./prestamos-atencion.requests";

const path = "/prestamos-atencion";

export const PrestamosAtencionService = {
  obtenerAlmacenesAutorizados: async () => {
    const res = await api.get<IRespuesta<RES_AlmacenAutorizado[]>>(
      `${path}/almacenes-autorizados`,
    );
    return res.data;
  },

  obtenerEmpleados: async () => {
    const res = await api.get<IRespuesta<RES_EmpleadoPrestamo[]>>(
      `${path}/empleados`,
    );
    return res.data;
  },

  obtenerLotesDisponibles: async (idProducto: number, idAlmacen: number) => {
    const res = await api.get<IRespuesta<RES_LoteDisponibleDespacho[]>>(
      `${path}/lotes`,
      { params: { id_producto: idProducto, id_almacen: idAlmacen } },
    );
    return res.data;
  },

  obtenerLotesDisponiblesBatch: async (
    idsProductos: number[],
    idAlmacen: number,
  ) => {
    const res = await api.get<IRespuesta<RES_LoteDisponibleDespacho[]>>(
      `${path}/lotes-batch`,
      {
        params: {
          ids_productos: idsProductos.join(","),
          id_almacen: idAlmacen,
        },
      },
    );
    return res.data;
  },

  obtenerPrestamos: async (
    idAlmacen: string,
    mes: string,
    yearcito: string,
  ) => {
    const res = await api.get<IRespuesta<RES_PrestamoAtencion[]>>(
      `${path}/prestamos`,
      { params: { id_almacen: idAlmacen, mes, yearcito } },
    );
    return res.data;
  },

  obtenerDetallePrestamo: async (idPrestamo: number) => {
    const res = await api.get<IRespuesta<RES_DetallePrestamoPorId>>(
      `${path}/ver`,
      { params: { id_prestamo: idPrestamo } },
    );
    return res.data;
  },

  registrarEntrega: async (dto: DTO_RegistrarEntrega, evidencias?: File[]) => {
    if (evidencias && evidencias.length > 0) {
      const formData = new FormData();
      formData.append("id_prestamo", dto.id_prestamo.toString());
      formData.append("id_empleado_recibe", dto.id_empleado_recibe.toString());
      if (dto.fecha_hora_entrega)
        formData.append("fecha_hora_entrega", dto.fecha_hora_entrega);
      if (dto.observacion) formData.append("observacion", dto.observacion);

      evidencias.forEach((file) => {
        formData.append("evidencias[]", file);
      });

      dto.detalles.forEach((detalle, index) => {
        Object.entries(detalle).forEach(([key, value]) => {
          formData.append(`detalles[${index}][${key}]`, String(value));
        });
      });

      const res = await api.post<
        IRespuesta<{ correlativo: string; id_entrega: number }>
      >(`${path}/despacho`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    }

    const res = await api.post<
      IRespuesta<{ correlativo: string; id_entrega: number }>
    >(`${path}/despacho`, dto);
    return res.data;
  },

  cambiarEstadoDetalle: async (data: {
    id_prestamo_detalle: number;
    nuevo_estado: string;
    comentario?: string;
  }) => {
    const res = await api.post<IRespuesta<null>>(
      `${path}/cambiar-estado`,
      data,
    );
    return res.data;
  },

  obtenerTrazabilidad: async (idPrestamoDetalle: number) => {
    const res = await api.get<IRespuesta<RES_TrazabilidadPrestamo[]>>(
      `${path}/trazabilidad`,
      { params: { id_prestamo_detalle: idPrestamoDetalle } },
    );
    return res.data;
  },

  obtenerHistorialReposiciones: async (idPrestamo: number) => {
    const res = await api.get<IRespuesta<RES_ReposicionPrestamo[]>>(
      `/prestamos-almacen/historial-reposiciones`,
      { params: { id_prestamo_almacen: idPrestamo } },
    );
    return res.data;
  },

  obtenerDetallesReposicionRecepcion: async (idReposicion: number) => {
    const res = await api.get<IRespuesta<RES_DetalleReposicionParaRecepcion[]>>(
      `/prestamos-almacen/detalles-recepcion-reposicion`,
      { params: { id_reposicion: idReposicion } },
    );
    return res.data;
  },

  listarUnidades: async () => {
    const res = await api.get<IRespuesta<RES_UnidadMedida[]>>(
      `${path}/catalogos/unidades`
    );
    return res.data;
  },

  getLotesDestino: async (
    idAlmacenSolicitante: number,
    idProductos: number[],
  ) => {
    const res = await api.get<IRespuesta<RES_LoteRecepcionReposicion[]>>(
      `${path}/catalogos/lotes-destino`,
      {
        params: {
          id_almacen: idAlmacenSolicitante,
          id_productos: idProductos.join(","),
        },
      },
    );
    return res.data;
  },

  recibirReposicion: async (recepData: {
    recepciones: {
      id_reabastecimiento_entrega: number;
      tipo_entrega?: "Solicitud" | "Prestamo" | "Reposicion";
      items: DTO_RecibirEntregaReposicionItem[];
    }[];
  }) => {
    const res = await api.post<IRespuesta<null>>(
      `/prestamos-almacen/recibir-reposicion`,
      recepData,
    );
    return res.data;
  },
};
