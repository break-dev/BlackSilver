export interface REQ_RegistrarReposicion {
  id_prestamo_almacen: number;
  id_almacen_entrega: number;
  id_empleado_registro: number;
  fecha_hora_reposicion: string;
  items: REQ_DetalleReposicionItem[];
  observacion?: string;
  evidencias?: File[];
}

export interface REQ_DetalleReposicionItem {
  id_prestamo_detalle: number;
  id_lote_producto: number;
  cantidad_base: number;
  cantidad_lote: number;
  cantidad_prestamo: number;
}
