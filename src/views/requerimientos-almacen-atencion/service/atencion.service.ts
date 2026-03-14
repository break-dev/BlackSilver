import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";
import type {
  RES_RequerimientoAlmacen,
  RES_DetalleRequerimiento,
  RES_Entrega,
  RES_Empleado,
  RES_Lote,
  RES_Trazabilidad,
} from "./atencion.responses";

import type {
  DTO_AtencionCambiarEstado,
  DTO_RegistrarEntrega,
  DTO_CrearSolicitudLogistica,
} from "./atencion.requests";

const path = "/requerimientos-atencion";

export const AtencionService = {
  obtenerAlmacenesAutorizados: async () => {
    const res = await api.get<
      IRespuesta<{ id_almacen: number; nombre: string }[]>
    >(`${path}/almacenes-autorizados`);
    return res.data;
  },

  obtenerEmpleados: async () => {
    const res = await api.get<IRespuesta<RES_Empleado[]>>(`${path}/empleados`);
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

  obtenerLotesDisponibles: async (
    idProducto: number | number[],
    idAlmacen: number,
  ) => {
    const res = await api.get<IRespuesta<RES_Lote[]>>(`${path}/lotes`, {
      params: { id_producto: idProducto, id_almacen: idAlmacen },
    });
    return res.data;
  },

  registrarEntrega: async (dto: DTO_RegistrarEntrega) => {
    const res = await api.post<IRespuesta<null>>(`${path}/save-entrega`, dto);
    return res.data;
  },

  obtenerHistorialEntregas: async (idRequerimiento: number) => {
    const res = await api.get<IRespuesta<RES_Entrega[]>>(`${path}/entregas`, {
      params: { id_requerimiento: idRequerimiento },
    });
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
};
