import type { EstadoVencimientoProducto } from "../../shared/enums/_generic/estado-vencimiento-producto";

export interface RES_LoteDisponible {
  id_lote: number;
  correlativo: string;
  //
  id_almacen: number;
  almacen_es_virtual: boolean;
  //
  id_producto: number;
  es_auditable: boolean;
  //
  stock_actual: number;
  contenido_por_presentacion: number;
  stock_actual_base: number;
  //
  id_unidad_medida_base: number;
  unidad_medida_base: string;
  unidad_medida_base_abv: string;
  //
  id_unidad_medida_lote: number;
  unidad_medida_lote: string;
  unidad_medida_lote_abv: string;
  //
  fecha_hora_ingreso: string;
  fecha_vencimiento: string | null;
  dias_para_vencer: number | null;
  estado_vencimiento: EstadoVencimientoProducto;
}

export interface RES_TicketLote {
  id: number; // id_lote
  producto: string; // nombre del producto
  lote: string; // es el correlatito del lote
  almacen: string; // nombre del almacen
  fecha_ingreso: string; // fecha de ingreso del lote
}
