import { Estado_OrdenCompra } from "../../../shared/enums/orden-compra/orden-compra";

export interface RES_OrdenCompra {
  id: number;
  correlativo: string;
  observacion: string | null;
  fecha_hora_orden: string;
  moneda: string;
  incluye_igv: boolean;
  porcentaje_igv: number;
  monto_igv: number;
  total_antes_igv: number;
  total_despues_igv: number;
  created_at: string;
  estado: Estado_OrdenCompra;
  // Cotización origen
  id_cotizacion: number;
  correlativo_cotizacion: string;
  // Empresa compradora
  id_empresa: number;
  empresa_nombre: string;
  empresa_ruc: string | null;
}

export interface RES_OrdenCompraDetalle {
  id: number;
  id_orden_compra: number;
  id_cotizacion_detalle: number;
  contenido_por_presentacion: number;
  cantidad_requerida: number;
  cantidad_requerida_base: number;
  estado: string;
  // Producto
  id_producto: number;
  producto_nombre: string;
  // Unidad de medida
  id_unidad_medida: number;
  unidad_medida_nombre: string;
  unidad_medida_abv: string;
}

export interface RES_ListadoOrdenCompra {
  ordenes: RES_OrdenCompra[];
}

export interface RES_AprobacionCotizacion {
  id_orden_compra: number;
  correlativo: string;
}
