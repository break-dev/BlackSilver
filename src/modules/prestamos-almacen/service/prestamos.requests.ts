export interface REQ_RegistrarReposicion {
  id_prestamo_almacen: number;
  id_almacen_entrega: number;
  id_empleado_registro: number;
  id_personal_recibe: number;
  fecha_hora_reposicion: string;
  items: REQ_DetalleReposicionItem[];
  observacion?: string;
  evidencias?: File[];
}

export interface REQ_DetalleReposicionItem {
  id_prestamo_detalle: number;
  /** Nulo cuando es activo fijo */
  id_lote_producto?: number | null;
  /** Poblado solo para activos fijos */
  id_activo_fijo?: number | null;
  cantidad_base: number;
  cantidad_lote: number;
  cantidad_prestamo: number;
}
