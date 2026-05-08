import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { RES_Empresa } from "./cotizaciones.responses";
import type { DTO_RegistrarComparativo } from "./cotizaciones.requests";
import type { RES_Proveedor } from "../../../service/responses/proveedor";
import type { RES_UnidadMedida } from "../../../service/responses/unidad-medida";
import type { RES_Producto } from "../../../service/responses/producto";
import type { RES_Almacen } from "../../../service/responses/almacen";
import type { RES_Comparativo } from "../../../service/responses/cotizaciones/cotizacion";
import type {
  RES_OrdenCompra,
  RES_OrdenCompraDetalle,
} from "../../../service/responses/ordenes-compra/orden-compra";

export const CotizacionesService = {
  /**
   * Obtener comparativos agrupados con cotizaciones y detalles
   */
  get_cotizaciones: async (
    mes?: number,
    year?: number,
  ): Promise<IRespuesta<RES_Comparativo[]>> => {
    const params: Record<string, number> = {};
    if (mes !== undefined) params.mes = mes;
    if (year !== undefined) params.year = year;
    const { data } = await api.get<IRespuesta<RES_Comparativo[]>>(
      "/cotizaciones",
      { params },
    );
    return data;
  },

  /**
   * Registrar un comparativo masivo con sus cotizaciones.
   * El response tiene el mismo formato que el listado (RES_Comparativo[]).
   */
  registrar_comparativo: async (
    dto: DTO_RegistrarComparativo,
  ): Promise<IRespuesta<RES_Comparativo[]>> => {
    const { data } = await api.post<IRespuesta<RES_Comparativo[]>>(
      "/cotizaciones/registrar",
      dto,
    );
    return data;
  },

  /**
   * Obtener proveedores habilitados para cotización
   */
  get_proveedores_maestro: async (): Promise<IRespuesta<RES_Proveedor[]>> => {
    const { data } = await api.get<IRespuesta<RES_Proveedor[]>>(
      "/cotizaciones/aux/proveedores",
    );
    return data;
  },

  /**
   * Obtener unidades de medida habilitadas
   */
  get_unidades_medida_maestro: async (): Promise<
    IRespuesta<RES_UnidadMedida[]>
  > => {
    const { data } = await api.get<IRespuesta<RES_UnidadMedida[]>>(
      "/cotizaciones/aux/unidades-medida",
    );
    return data;
  },

  /**
   * Obtener catálogo de productos maestros
   */
  get_productos_maestro: async (): Promise<IRespuesta<RES_Producto[]>> => {
    const { data } = await api.get<IRespuesta<RES_Producto[]>>(
      "/cotizaciones/aux/productos",
    );
    return data;
  },

  /**
   * Obtener empresas
   */
  get_empresas_maestro: async (): Promise<IRespuesta<RES_Empresa[]>> => {
    const { data } = await api.get<IRespuesta<RES_Empresa[]>>(
      "/cotizaciones/aux/empresas",
    );
    return data;
  },

  /**
   * Obtener almacenes activos para seleccionar el recepcionista
   */
  get_almacenes_maestro: async (): Promise<IRespuesta<RES_Almacen[]>> => {
    const { data } = await api.get<IRespuesta<RES_Almacen[]>>(
      "/cotizaciones/aux/almacenes",
    );
    return data;
  },

  /**
   * Aprobar una cotización específica con selección parcial de productos
   */
  aprobar_cotizacion: async (
    id_cotizacion: number,
    payload: {
      id_empresa_compradora: number;
      detalles_aprobados: { id: number; precio_confirmado: number }[];
      tipo_cambio_aplicado?: number;
    },
  ): Promise<IRespuesta<{ id_orden_compra: number; correlativo: string }>> => {
    // Retorna un objeto con id_orden_compra y correlativo de la OC generada
    const { data } = await api.post<
      IRespuesta<{ id_orden_compra: number; correlativo: string }>
    >(`/cotizaciones/${id_cotizacion}/aprobar`, payload);
    return data;
  },

  /**
   * Obtener una orden de compra generada desde cotizaciones con sus detalles
   */
  get_orden_compra: async (
    id_orden_compra: number,
  ): Promise<
    IRespuesta<RES_OrdenCompra & { detalles: RES_OrdenCompraDetalle[] }>
  > => {
    const { data } = await api.get<
      IRespuesta<RES_OrdenCompra & { detalles: RES_OrdenCompraDetalle[] }>
    >(`/cotizaciones/ordenes-compra/${id_orden_compra}`);
    return data;
  },
};
