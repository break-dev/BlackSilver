import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";
import type {
  RES_AlmacenSecundario,
  RES_PrestamoResumen,
  RES_PrestamoDetalle,
  RES_Trazabilidad,
  RES_HistorialEntregaPrestamo,
} from "./prestamos.responses";

const path = "/prestamos-almacen";

export const PrestamosService = {
  /**
   * Obtiene la lista de almacenes secundarios
   */
  getAlmacenesSecundarios: async () => {
    const response = await api.get<IRespuesta<RES_AlmacenSecundario[]>>(
      `${path}/almacenes-secundarios`,
    );
    return response.data.data;
  },

  /**
   * Obtiene el resumen de préstamos por almacén y periodo
   */
  getPrestamosResumen: async (
    idAlmacen: number,
    mes: number,
    yearcito: number,
  ) => {
    const response = await api.get<IRespuesta<RES_PrestamoResumen[]>>(
      `${path}/resumen`,
      {
        params: { id_almacen: idAlmacen, mes, yearcito },
      },
    );
    return response.data.data;
  },

  /**
   * Obtiene los detalles de un préstamo
   */
  getDetallesPrestamo: async (idPrestamo: number) => {
    const response = await api.get<IRespuesta<RES_PrestamoDetalle[]>>(
      `${path}/detalles-prestamo`,
      {
        params: { id_prestamo: idPrestamo },
      },
    );
    return response.data.data;
  },

  /**
   * Obtiene la trazabilidad de un detalle de préstamo
   */
  getTrazabilidadDetalle: async (idPrestamoDetalle: number) => {
    const response = await api.get<IRespuesta<RES_Trazabilidad[]>>(
      `${path}/trazabilidad`,
      {
        params: { id_prestamo_detalle: idPrestamoDetalle },
      },
    );
    return response.data.data;
  },

  /**
   * Obtiene el historial de entregas de un préstamo
   */
  getHistorialEntregas: async (idPrestamo: number) => {
    const response = await api.get<IRespuesta<RES_HistorialEntregaPrestamo[]>>(
      `${path}/historial-entregas`,
      {
        params: { id_prestamo: idPrestamo },
      },
    );
    return response.data.data;
  },
};
