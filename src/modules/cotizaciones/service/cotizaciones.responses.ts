import { Estado_Cotizacion } from "../../../shared/enums/cotizacion/cotizacion";
import { MetodoPago } from "../../../shared/enums/_generic/metodo-pago";

export interface RES_Cotizacion {
  id: number;
  id_comparativo: number;
  id_proveedor: number;
  proveedor_nombre: string;
  moneda: string;
  correlativo: string;
  numero_correlativo: number;
  metodo_pago: MetodoPago;
  fecha_vencimiento_pago: string | null;
  total_antes_igv: number;
  incluye_igv: boolean;
  porcentaje_igv: number;
  monto_igv: number;
  total_despues_igv: number;
  observacion: string | null;
  evidencia: string | null;
  fecha_hora_cotizacion: string;
  comparativo_fecha: string;
  estado: Estado_Cotizacion;
  created_at: string;
}

export interface RES_CotizacionDetalle {
  id: number;
  id_cotizacion: number;
  id_comparativo_detalle: number;
  id_unidad_medida: number;
  producto_nombre: string;
  unidad_medida_nombre: string;
  unidad_medida_abv: string;
  cantidad: number;
  contenido_por_presentacion: number;
  cantidad_base: number;
  precio_unitario: number;
  precio_unitario_base: number;
  comentario: string | null;
  no_cotiza: number;
  unidad_medida_base_abv: string;
}

export interface RES_ListadoComparativo {
  cotizaciones: RES_Cotizacion[];
  detalles: RES_CotizacionDetalle[];
}

export interface RES_MaestroProveedor {
  id_proveedor: number;
  razon_social: string;
  ruc: string | null;
  dni: string | null;
}

export interface RES_MaestroUnidadMedida {
  id_unidad_medida: number;
  nombre: string;
  abreviatura: string;
  es_base: boolean;
}

export interface RES_MaestroProducto {
  id_producto: number;
  nombre: string;
  codigo?: string;
  categoria_nombre: string;
  id_unidad_medida_base: number;
  unidad_medida_base: string;
  unidad_medida_abreviatura: string;
}
