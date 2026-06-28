export interface REQ_RegistrarReposicion {
  id_prestamo_almacen: number;
  id_almacen_entrega: number;
  id_empleado_registro: number;
  id_empleado_recibe?: number | null;
  fecha_hora_reposicion: string;
  items: REQ_DetalleReposicionItem[];
  observacion?: string;
  evidencias?: File[];
  // Transport fields
  medio_entrega: string;
  id_proveedor_transporte?: number | null;
  id_agencia_transporte?: number | null;
  numero_factura?: string | null;
  serie_factura?: string | null;
  serie_guia_transportista?: string | null;
  numero_guia_transportista?: string | null;
  serie_guia_remitente?: string | null;
  numero_guia_remitente?: string | null;
  costo_envio?: number | null;
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
