export interface RES_LoteDisponible {
  id_lote: number;
  id_producto: number;
  correlativo: string;
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
  estado_vencimiento: string;
}

export interface RES_TicketLote {
  id: number;
  producto: string;
  lote: string;
  almacen: string;
  fecha_ingreso: string;
}