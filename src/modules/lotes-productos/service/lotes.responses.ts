import type { EstadoVencimientoProducto } from "../../../shared/enums/_generic/estado-vencimiento-producto";

export interface RES_Lote {
  id_lote: number;
  id_producto: number;
  id_almacen: number;
  id_unidad_medida: number;
  producto: string;
  unidad_medida_base: string;
  categoria: string | null;
  unidad_medida: string;
  descripcion: string | null;
  correlativo: string;
  stock_actual: number;
  contenido_por_presentacion: number;
  stock_actual_base: number;
  fecha_hora_ingreso: string;
  fecha_vencimiento: string | null;
  estado: string;
  es_perecible: boolean;
  es_auditable: boolean;
  stock_minimo_base: number;
  dias_espera_vencimiento: number | null;
  dias_para_vencer: number | null;
  estado_vencimiento: EstadoVencimientoProducto;
  // Costo y Origen de Compra
  costo_por_unidad: number | null;
  serie_factura_compra: string | null;
  numero_factura_compra: string | null;
  id_orden_compra: number | null;
  id_orden_compra_comprobante: number | null;
  id_orden_compra_detalle: number | null;
}