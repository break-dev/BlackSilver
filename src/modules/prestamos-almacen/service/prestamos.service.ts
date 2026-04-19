import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { RES_LoteDisponible } from "../../../service/responses/lote-producto";
import type { REQ_RegistrarReposicion } from "./prestamos.requests";
import type { RES_Almacen } from "../../../service/responses/almacen";
import type { RES_PersonalExterno } from "../../../service/responses/personal-externo";
import type {
  RES_Prestamo,
  RES_PrestamoDetalle,
} from "../../../service/responses/prestamos/prestamo";
import type { RES_Trazabilidad } from "../../../service/responses/_generic/trazabilidad";
import type { RES_PrestamoEntrega } from "../../../service/responses/prestamos/prestamo-entrega";
import type { RES_PrestamoReposicion } from "../../../service/responses/prestamos/prestamo-reposicion";

const path = "/prestamos-almacen";

export const PrestamosService = {
  /**
   * Obtiene la lista de almacenes secundarios
   */
  getAlmacenesSecundarios: async () => {
    const response = await api.get<IRespuesta<RES_Almacen[]>>(
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
    const response = await api.get<IRespuesta<RES_Prestamo[]>>(
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
    const response = await api.get<IRespuesta<RES_PrestamoEntrega[]>>(
      `${path}/historial-entregas`,
      {
        params: { id_prestamo: idPrestamo },
      },
    );
    return response.data.data;
  },

  getAlmacenesPrincipales: async () => {
    const { data } = await api.get<
      IRespuesta<{ id_almacen: number; nombre: string }[]>
    >("/prestamos-almacen/almacenes", { params: { es_principal: true } });
    return data;
  },

  getLotesDisponibles: async (idsProductos: number[], idAlmacen: number) => {
    const { data } = await api.get<IRespuesta<RES_LoteDisponible[]>>(
      "/prestamos-almacen/lotes",
      {
        params: { ids_productos: idsProductos, id_almacen: idAlmacen },
      },
    );
    return data;
  },

  getHistorialReposiciones: async (idPrestamo: number) => {
    const { data } = await api.get<IRespuesta<RES_PrestamoReposicion[]>>(
      `/prestamos-almacen/historial-reposiciones`,
      { params: { id_prestamo_almacen: idPrestamo } },
    );
    return data;
  },

  registrarReposicion: async (repo: REQ_RegistrarReposicion) => {
    const { data } = await api.post<
      IRespuesta<{ id: number; correlativo: string }>
    >(`${path}/registrar-reposicion`, repo, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  obtenerPersonalExterno: async () => {
    const res = await api.get<IRespuesta<RES_PersonalExterno[]>>(
      `${path}/personal-externo`,
    );
    return res.data;
  },

  crearPersonalExterno: async (dto: {
    nombre: string;
    apellido?: string;
    dni?: string;
  }) => {
    const res = await api.post<IRespuesta<RES_PersonalExterno>>(
      `${path}/personal-externo`,
      dto,
    );
    return res.data;
  },
};
