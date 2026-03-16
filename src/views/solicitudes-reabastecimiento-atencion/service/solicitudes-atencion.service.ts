import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";
import type {
  RES_SolicitudReabastecimiento,
  RES_DetalleSolicitud,
  RES_DetalleLog,
  RES_EntregaReabastecimiento,
  RES_LoteReabastecimiento,
  RES_Almacen,
  RES_Empleado,
} from "./solicitudes-atencion.responses";
import type {
  DTO_DecisionDetalle,
  DTO_RegistrarEntregaReabastecimiento,
} from "./solicitudes-atencion.requests";

const path = "/solicitudes-atencion";

export const SolicitudesAtencionService = {
  obtenerSolicitudes: async (idAlmacen: number, mes: string, yearcito: string) => {
    const res = await api.get<IRespuesta<RES_SolicitudReabastecimiento[]>>(
      `${path}`,
      {
        params: { id_almacen: idAlmacen, mes, yearcito },
      }
    );
    return res.data;
  },

  obtenerDetallesSolicitud: async (idSolicitud: number) => {
    const res = await api.get<IRespuesta<RES_DetalleSolicitud[]>>(
      `${path}/detalles-by-solicitud`,
      {
        params: { id_solicitud: idSolicitud },
      }
    );
    return res.data;
  },

  guardarDecisionDetalle: async (dto: DTO_DecisionDetalle) => {
    const res = await api.put<IRespuesta<null>>(
      `${path}/save-decision-detalle`,
      dto
    );
    return res.data;
  },

  obtenerTrazabilidad: async (idDetalle: number) => {
    const res = await api.get<IRespuesta<RES_DetalleLog[]>>(
      `${path}/trazabilidad`,
      {
        params: { id_detalle: idDetalle },
      }
    );
    return res.data;
  },

  obtenerHistorialEntregas: async (idSolicitud: number) => {
    const res = await api.get<IRespuesta<RES_EntregaReabastecimiento[]>>(
      `${path}/entregas`,
      {
        params: { id_solicitud: idSolicitud },
      }
    );
    return res.data;
  },

  registrarEntrega: async (dto: DTO_RegistrarEntregaReabastecimiento) => {
    const res = await api.post<IRespuesta<string>>(
      `${path}/entregas`,
      dto
    );
    return res.data;
  },

  obtenerAlmacenes: async (esPrincipal: boolean = false) => {
    const res = await api.get<IRespuesta<RES_Almacen[]>>(
      `${path}/auxiliares/almacenes`,
      {
        params: { es_principal: esPrincipal ? 1 : 0 },
      }
    );
    return res.data;
  },

  obtenerEmpleados: async () => {
    const res = await api.get<IRespuesta<RES_Empleado[]>>(
      `${path}/auxiliares/empleados`
    );
    return res.data;
  },

  obtenerLotesDisponibles: async (idsProductos: number[], idAlmacen: number) => {
    const res = await api.get<IRespuesta<RES_LoteReabastecimiento[]>>(
      `${path}/auxiliares/lotes`,
      {
        params: { ids_productos: idsProductos, id_almacen: idAlmacen },
      }
    );
    return res.data;
  },
};
