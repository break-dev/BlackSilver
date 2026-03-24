import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";
import type {
  RES_AlmacenAutorizado,
  RES_PrestamoAtencion,
  RES_DetallePrestamoPorId,
  RES_LoteDisponibleDespacho,
  RES_EmpleadoPrestamo,
  RES_TrazabilidadPrestamo,
} from "./prestamos-atencion.responses";
import type { DTO_RegistrarDespacho } from "./prestamos-atencion.requests";

const path = "/prestamos-atencion";

export const PrestamosAtencionService = {
  obtenerAlmacenesAutorizados: async () => {
    const res = await api.get<IRespuesta<RES_AlmacenAutorizado[]>>(
      `${path}/almacenes-autorizados`
    );
    return res.data;
  },

  obtenerEmpleados: async () => {
    const res = await api.get<IRespuesta<RES_EmpleadoPrestamo[]>>(
      `${path}/empleados`
    );
    return res.data;
  },

  obtenerLotesDisponibles: async (idProducto: number, idAlmacen: number) => {
    const res = await api.get<IRespuesta<RES_LoteDisponibleDespacho[]>>(
      `${path}/lotes`,
      { params: { id_producto: idProducto, id_almacen: idAlmacen } }
    );
    return res.data;
  },

  obtenerLotesDisponiblesBatch: async (idsProductos: number[], idAlmacen: number) => {
    const res = await api.get<IRespuesta<RES_LoteDisponibleDespacho[]>>(
      `${path}/lotes-batch`,
      { params: { ids_productos: idsProductos.join(','), id_almacen: idAlmacen } }
    );
    return res.data;
  },

  obtenerPrestamos: async (idAlmacen: string, mes: string, yearcito: string) => {
    const res = await api.get<IRespuesta<RES_PrestamoAtencion[]>>(
      `${path}/prestamos`,
      { params: { id_almacen: idAlmacen, mes, yearcito } }
    );
    return res.data;
  },

  obtenerDetallePrestamo: async (idPrestamo: number) => {
    const res = await api.get<IRespuesta<RES_DetallePrestamoPorId>>(
      `${path}/ver`,
      { params: { id_prestamo: idPrestamo } }
    );
    return res.data;
  },

  registrarDespacho: async (dto: DTO_RegistrarDespacho) => {
    const res = await api.post<IRespuesta<{ correlativo: string; id_entrega: number }>>(
      `${path}/despacho`,
      dto
    );
    return res.data;
  },

  cambiarEstadoDetalle: async (data: { id_prestamo_detalle: number; nuevo_estado: string; comentario?: string }) => {
    const res = await api.post<IRespuesta<null>>(
      `${path}/cambiar-estado`,
      data
    );
    return res.data;
  },

  obtenerTrazabilidad: async (idPrestamoDetalle: number) => {
    const res = await api.get<IRespuesta<RES_TrazabilidadPrestamo[]>>(
      `${path}/trazabilidad`,
      { params: { id_prestamo_detalle: idPrestamoDetalle } }
    );
    return res.data;
  },
};
