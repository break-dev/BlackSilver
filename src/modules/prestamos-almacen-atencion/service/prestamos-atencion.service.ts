import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";

import type {
  DTO_RegistrarEntrega,
  DTO_RegistrarRecepcionReposicion,
} from "./prestamos-atencion.requests";
import type {
  RES_LoteDisponible,
  RES_TicketLote,
} from "../../../service/responses/lote-producto";
import type { RES_Almacen } from "../../../service/responses/almacen";
import type { RES_Empleado } from "../../../service/responses/empleado";
import type { RES_UnidadMedida } from "../../../service/responses/unidad-medida";
import type {
  RES_Prestamo,
  RES_PrestamoDetalle,
} from "../../../service/responses/prestamos/prestamo";
import type { RES_PrestamoEntrega } from "../../../service/responses/prestamos/prestamo-entrega";
import type { RES_Trazabilidad } from "../../../service/responses/_generic/trazabilidad";
import type { RES_PrestamoReposicion } from "../../../service/responses/prestamos/prestamo-reposicion";
import type {
  RES_PrestamoReposicionRecepcion,
  RES_PrestamoReposicionRecepcionDetalle,
} from "../../../service/responses/prestamos/prestamo-reposicion-recepcion";
import type { RES_PrestamoEntregaRecepcion } from "../../../service/responses/prestamos/prestamo-entrega-recepcion";

const path = "/prestamos-atencion";

export const PrestamosAtencionService = {
  obtenerAlmacenesAutorizados: async () => {
    const res = await api.get<IRespuesta<RES_Almacen[]>>(
      `${path}/almacenes-autorizados`,
    );
    return res.data;
  },

  obtenerEmpleados: async () => {
    const res = await api.get<IRespuesta<RES_Empleado[]>>(`${path}/empleados`);
    return res.data;
  },

  obtenerLotesDisponibles: async (idProducto: number, idAlmacen: number) => {
    const res = await api.get<IRespuesta<RES_LoteDisponible[]>>(
      `${path}/lotes`,
      { params: { id_producto: idProducto, id_almacen: idAlmacen } },
    );
    return res.data;
  },

  obtenerLotesDisponiblesBatch: async (
    idsProductos: number[],
    idAlmacen: number,
  ) => {
    const res = await api.get<IRespuesta<RES_LoteDisponible[]>>(
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
    const res = await api.get<IRespuesta<RES_Prestamo[]>>(`${path}/prestamos`, {
      params: { id_almacen: idAlmacen, mes, yearcito },
    });
    return res.data;
  },

  obtenerDetallePrestamo: async (idPrestamo: number) => {
    const res = await api.get<IRespuesta<{ detalles: RES_PrestamoDetalle[] }>>(
      `${path}/ver`,
      {
        params: { id_prestamo: idPrestamo },
      },
    );
    return res.data;
  },

  obtenerHistorialEntregas: async (idPrestamo: number) => {
    const res = await api.get<IRespuesta<RES_PrestamoEntrega[]>>(
      `${path}/historial-entregas`,
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
    id_prestamo_detalle?: number;
    ids_detalles?: number[];
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
    const res = await api.get<IRespuesta<RES_Trazabilidad[]>>(
      `${path}/trazabilidad`,
      { params: { id_prestamo_detalle: idPrestamoDetalle } },
    );
    return res.data;
  },

  obtenerHistorialReposiciones: async (idPrestamo: number) => {
    const res = await api.get<IRespuesta<RES_PrestamoReposicion[]>>(
      `/prestamos-almacen/historial-reposiciones`,
      { params: { id_prestamo_almacen: idPrestamo } },
    );
    return res.data;
  },

  obtenerDetallesReposicionRecepcion: async (idReposicion: number) => {
    const res = await api.get<
      IRespuesta<RES_PrestamoReposicionRecepcionDetalle[]>
    >(`${path}/recepciones-reposicion/detalles`, {
      params: { id_reposicion: idReposicion },
    });
    return res.data;
  },

  listarUnidades: async () => {
    const res = await api.get<IRespuesta<RES_UnidadMedida[]>>(
      `${path}/catalogos/unidades`,
    );
    return res.data;
  },

  getLotesDestino: async (
    idAlmacenSolicitante: number,
    idProductos: number[],
  ) => {
    const res = await api.get<IRespuesta<RES_LoteDisponible[]>>(
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

  registrarRecepcionReposicion: async (
    dto: DTO_RegistrarRecepcionReposicion,
    evidencias?: File[],
  ) => {
    const formData = new FormData();
    formData.append("id_reposicion", dto.id_reposicion.toString());
    formData.append("fecha_hora_recepcion", dto.fecha_hora_recepcion);
    formData.append("con_incidencia", String(dto.con_incidencia));
    if (dto.observacion) formData.append("observacion", dto.observacion);

    if (evidencias) {
      evidencias.forEach((file) => formData.append("evidencias[]", file));
    }

    formData.append("items", JSON.stringify(dto.items));

    const res = await api.post<IRespuesta<RES_TicketLote[]>>(
      `${path}/recepciones-reposicion`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data;
  },

  obtenerHistorialRecepcionesReposicion: async (idReposicion: number) => {
    const res = await api.get<IRespuesta<RES_PrestamoReposicionRecepcion[]>>(
      `${path}/recepciones-reposicion/historial`,
      { params: { id_reposicion: idReposicion } },
    );
    return res.data;
  },

  obtenerHistorialRecepcionesEntrega: async (idEntrega: number) => {
    const res = await api.get<IRespuesta<RES_PrestamoEntregaRecepcion[]>>(
      `${path}/recepciones`,
      { params: { id_prestamo_entrega: idEntrega } },
    );
    return res.data;
  },
};
