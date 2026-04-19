import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type {
  RES_ListadoComparativo,
  RES_MaestroProducto,
  RES_MaestroProveedor,
  RES_MaestroUnidadMedida,
  RES_MaestroEmpresa,
  RES_RegistroComparativo,
} from "./cotizaciones.responses";
import type { RES_AprobacionCotizacion } from "../../orden-compra/service/orden-compra.responses";
import type { DTO_RegistrarComparativo } from "./cotizaciones.requests";

export const CotizacionesService = {
  /**
   * Obtener todas las cotizaciones agrupadas por comparativo
   */
  get_cotizaciones: async (): Promise<IRespuesta<RES_ListadoComparativo>> => {
    const { data } =
      await api.get<IRespuesta<RES_ListadoComparativo>>("/cotizaciones");
    return data;
  },

  /**
   * Registrar un comparativo masivo con sus cotizaciones
   */
  registrar_comparativo: async (
    dto: DTO_RegistrarComparativo,
  ): Promise<IRespuesta<RES_RegistroComparativo>> => {
    const { data } = await api.post<IRespuesta<RES_RegistroComparativo>>(
      "/cotizaciones/registrar",
      dto,
    );
    return data;
  },

  /**
   * Obtener proveedores habilitados para cotización
   */
  get_proveedores_maestro: async (): Promise<
    IRespuesta<RES_MaestroProveedor[]>
  > => {
    const { data } = await api.get<IRespuesta<RES_MaestroProveedor[]>>(
      "/cotizaciones/proveedores",
    );
    return data;
  },

  /**
   * Obtener unidades de medida habilitadas
   */
  get_unidades_medida_maestro: async (): Promise<
    IRespuesta<RES_MaestroUnidadMedida[]>
  > => {
    const { data } = await api.get<IRespuesta<RES_MaestroUnidadMedida[]>>(
      "/cotizaciones/unidades-medida",
    );
    return data;
  },

  /**
   * Obtener catálogo de productos maestros
   */
  get_productos_maestro: async (): Promise<
    IRespuesta<RES_MaestroProducto[]>
  > => {
    const { data } = await api.get<IRespuesta<RES_MaestroProducto[]>>(
      "/cotizaciones/productos",
    );
    return data;
  },

  /**
   * Obtener empresas (utiliza el endpoint general de empresas)
   */
  get_empresas_maestro: async (): Promise<
    IRespuesta<RES_MaestroEmpresa[]>
  > => {
    const { data } = await api.get<IRespuesta<RES_MaestroEmpresa[]>>(
      "/empresas",
    );
    return data;
  },

  /**
   * Aprobar una cotización específica (Desestima las otras del mismo grupo)
   */
  aprobar_cotizacion: async (
    id_cotizacion: number,
    payload: {
      id_empresa_compradora: number;
      detalles_aprobados: number[];
    }
  ): Promise<IRespuesta<RES_AprobacionCotizacion>> => {
    const { data } = await api.post<IRespuesta<RES_AprobacionCotizacion>>(
      `/cotizaciones/${id_cotizacion}/aprobar`,
      payload
    );
    return data;
  },
};
