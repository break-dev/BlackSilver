import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";
import type { 
  RES_ListadoComparativo,
  RES_MaestroProducto, 
  RES_MaestroProveedor, 
  RES_MaestroUnidadMedida 
} from "./cotizaciones.responses";
import type { DTO_RegistrarComparativo } from "./cotizaciones.requests";

export const CotizacionesService = {
  /**
   * Obtener todas las cotizaciones agrupadas por comparativo
   */
  get_cotizaciones: async (): Promise<IRespuesta<RES_ListadoComparativo>> => {
    const { data } = await api.get<IRespuesta<RES_ListadoComparativo>>("/cotizaciones");
    return data;
  },

  /**
   * Registrar un comparativo masivo con sus cotizaciones
   */
  registrar_comparativo: async (dto: DTO_RegistrarComparativo): Promise<IRespuesta<null>> => {
    const { data } = await api.post<IRespuesta<null>>("/cotizaciones/registrar", dto);
    return data;
  },

  /**
   * Obtener proveedores habilitados para cotización
   */
  get_proveedores_maestro: async (): Promise<IRespuesta<RES_MaestroProveedor[]>> => {
    const { data } = await api.get<IRespuesta<RES_MaestroProveedor[]>>("/cotizaciones/proveedores");
    return data;
  },

  /**
   * Obtener unidades de medida habilitadas
   */
  get_unidades_medida_maestro: async (): Promise<IRespuesta<RES_MaestroUnidadMedida[]>> => {
    const { data } = await api.get<IRespuesta<RES_MaestroUnidadMedida[]>>("/cotizaciones/unidades-medida");
    return data;
  },

  /**
   * Obtener catálogo de productos maestros
   */
  get_productos_maestro: async (): Promise<IRespuesta<RES_MaestroProducto[]>> => {
    const { data } = await api.get<IRespuesta<RES_MaestroProducto[]>>("/cotizaciones/productos");
    return data;
  },

  /**
   * Aprobar una cotización específica (Desestima las otras del mismo grupo)
   */
  aprobar_cotizacion: async (id_cotizacion: number): Promise<IRespuesta<null>> => {
    const { data } = await api.post<IRespuesta<null>>(`/cotizaciones/${id_cotizacion}/aprobar`);
    return data;
  },
};
