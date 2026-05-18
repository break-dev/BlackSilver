export interface DTO_ItemRecepcionTransferencia {
  id_detalle_transferencia: number;
  /** false para activos fijos (no aplica) */
  es_activo_fijo: boolean;
  /** Poblado solo si es_activo_fijo = true */
  id_activo_fijo?: number | null;
  cantidad_base: number;
  /** false para activos fijos */
  es_nuevo_lote: boolean;
  id_lote_existente: number | null;
  descripcion?: string | null;
  fecha_ingreso?: string | null;
  fecha_vencimiento?: string | null;
}

export interface DTO_RegistrarRecepcionTransferencia {
  id_transferencia: number;
  id_almacen_recepcionista: number;
  con_incidencia: boolean;
  observacion?: string | null;
  fecha_hora_recepcion?: string | null;
  items: DTO_ItemRecepcionTransferencia[];
}
