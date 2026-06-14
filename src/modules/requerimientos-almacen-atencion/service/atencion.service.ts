import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type {
  DTO_AtencionCambiarEstado,
  DTO_RegistrarEntrega,
  DTO_CrearSolicitudLogistica,
  DTO_CrearRequerimiento,
} from "./atencion.requests";
import type { RES_Trazabilidad } from "../../../service/responses/_generic/trazabilidad";
import type { RES_Almacen } from "../../../service/responses/almacen";
import type {
  RES_DetalleRequerimiento,
  RES_RequerimientoAlmacen,
} from "../../../service/responses/requerimientos-almacen/requerimiento-almacen";
import type { RES_EntregaRequerimiento } from "../../../service/responses/requerimientos-almacen/requerimiento-almacen-entrega";
import type { RES_Mina } from "../../../service/responses/mina";
import type { RES_Labor } from "../../../service/responses/labor";

const path = "/requerimientos-atencion";

export const AtencionService = {
  registrarRequerimiento: async (dto: DTO_CrearRequerimiento) => {
    const formData = new FormData();
    formData.append(
      "id_contratista_solicitante",
      String(dto.id_contratista_solicitante),
    );
    formData.append("id_mina", String(dto.id_mina));
    formData.append("id_almacen_destino", String(dto.id_almacen_destino));
    formData.append("premura", dto.premura);
    formData.append("es_auditable", dto.es_auditable ? "1" : "0");
    if (dto.fecha_entrega_requerida) {
      formData.append("fecha_entrega_requerida", dto.fecha_entrega_requerida);
    }
    if (dto.observacion) {
      formData.append("observacion", dto.observacion);
    }

    if (dto.id_labores) {
      dto.id_labores.forEach((id) => formData.append("labores[]", String(id)));
    }

    dto.detalles.forEach((det, index) => {
      formData.append(
        `detalles[${index}][id_producto]`,
        String(det.id_producto),
      );
      formData.append(
        `detalles[${index}][id_unidad_medida]`,
        String(det.id_unidad_medida),
      );
      formData.append(
        `detalles[${index}][cantidad_solicitada]`,
        String(det.cantidad_solicitada),
      );
      formData.append(
        `detalles[${index}][contenido_por_presentacion]`,
        String(det.contenido_por_presentacion),
      );
      if (det.comentario) {
        formData.append(`detalles[${index}][comentario]`, det.comentario);
      }
      if (det.id_activo_fijo_destino) {
        formData.append(
          `detalles[${index}][id_activo_fijo_destino]`,
          String(det.id_activo_fijo_destino),
        );
      }
    });

    if (dto.evidencias) {
      dto.evidencias.forEach((file) => formData.append("evidencias[]", file));
    }

    const res = await api.post<IRespuesta<RES_RequerimientoAlmacen>>(
      path,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  },

  cambiarEstadoDetalle: async (dto: DTO_AtencionCambiarEstado) => {
    const res = await api.put<IRespuesta<null>>(
      `${path}/save-decision-detalle`,
      dto,
    );
    return res.data;
  },

  obtenerDetallesRequerimiento: async (idRequerimiento: number) => {
    const res = await api.get<IRespuesta<RES_DetalleRequerimiento[]>>(
      `${path}/detalles-by-requerimiento`,
      {
        params: { id_requerimiento: idRequerimiento },
      },
    );
    return res.data;
  },

  registrarEntrega: async (dto: DTO_RegistrarEntrega) => {
    if (dto.evidencias && dto.evidencias.length > 0) {
      const formData = new FormData();
      formData.append("id_requerimiento", dto.id_requerimiento.toString());
      formData.append("id_empleado_recibe", dto.id_empleado_recibe.toString());
      formData.append("fecha_entrega", dto.fecha_entrega);
      if (dto.observacion) formData.append("observacion", dto.observacion);

      dto.evidencias.forEach((file) => {
        formData.append("evidencias[]", file);
      });

      // Laravel expects details as a nested array/object structure in FormData
      dto.detalles.forEach((detalle, index) => {
        Object.entries(detalle).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            const strVal = typeof value === "boolean" ? (value ? "1" : "0") : value.toString();
            formData.append(`detalles[${index}][${key}]`, strVal);
          }
        });
      });

      const res = await api.post<IRespuesta<null>>(
        `${path}/save-entrega`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return res.data;
    }

    const res = await api.post<IRespuesta<null>>(`${path}/save-entrega`, dto);
    return res.data;
  },

  obtenerHistorialEntregas: async (idRequerimiento: number) => {
    const res = await api.get<IRespuesta<RES_EntregaRequerimiento[]>>(
      `${path}/entregas`,
      {
        params: { id_requerimiento: idRequerimiento },
      },
    );
    return res.data;
  },

  obtenerTrazabilidad: async (idDetalle: number) => {
    const res = await api.get<IRespuesta<RES_Trazabilidad[]>>(
      `${path}/trazabilidad`,
      {
        params: { id_requerimiento_almacen_detalle: idDetalle },
      },
    );
    return res.data;
  },

  obtenerRequerimientos: async (
    idAlmacen: string,
    mes: string,
    yearcito: string,
  ) => {
    const res = await api.get<IRespuesta<RES_RequerimientoAlmacen[]>>(
      `${path}/requerimientos`,
      {
        params: { id_almacen: idAlmacen, mes, yearcito },
      },
    );
    return res.data;
  },

  registrarSolicitudLogistica: async (dto: DTO_CrearSolicitudLogistica) => {
    const res = await api.post<IRespuesta<null>>(
      `${path}/save-solicitud-logistica`,
      dto,
    );
    return res.data;
  },

  // Catálogos para el registro
  listarMinas: async () => {
    const res = await api.get<IRespuesta<RES_Mina[]>>(`${path}/minas`);
    return res.data;
  },

  listarAlmacenesPorMina: async (idMina: number) => {
    const res = await api.get<IRespuesta<RES_Almacen[]>>(`${path}/almacenes`, {
      params: { id_mina: idMina },
    });
    return res.data;
  },

  listarLaboresPorMina: async (idMina: number) => {
    const res = await api.get<IRespuesta<RES_Labor[]>>(`${path}/labores`, {
      params: { id_mina: idMina },
    });
    return res.data;
  },

  obtenerDataByMina: async (idMina: number) => {
    const res = await api.get<
      IRespuesta<{
        responsables: { id_contratista: number; nombre_completo: string }[];
        labores: RES_Labor[];
      }>
    >(`${path}/data-by-mina`, {
      params: { id_mina: idMina },
    });
    return res.data;
  },

  obtenerMinasPorAlmacen: async (idAlmacen: number) => {
    const res = await api.get<IRespuesta<RES_Mina[]>>(
      `${path}/minas-by-almacen`,
      {
        params: { id_almacen: idAlmacen },
      },
    );
    return res.data;
  },
};
