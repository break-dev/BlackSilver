export interface DTO_RegistrarEntrega {
  id_prestamo: number;
  id_empleado_recibe?: number | null;
  fecha_hora_entrega?: string;
  observacion?: string;
  detalles: DTO_DetalleEntrega[];
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

export interface DTO_DetalleEntrega {
  id_prestamo_detalle: number;
  /** Nulo cuando es activo fijo */
  id_lote_producto?: number | null;
  /** Poblado solo para activos fijos */
  id_activo_fijo?: number | null;
  cantidad_lote: number;
  cantidad_base: number;
  cantidad_solicitud: number;
}

export interface DTO_RecibirEntregaReposicionItem {
  id_entrega_detalle: number;
  id_producto: number;
  id_lote_producto: number | null; // El lote de destino
  id_lote_existente: number | null; // Alias para compatibilidad
  cantidad_base: number;
  cantidad_lote: number;
  cantidad_solicitud: number;
  id_unidad_medida: number;
  id_unidad_medida_solicitada: number;
  id_solicitud_reabastecimiento_detalle: number;
  es_nuevo_lote: boolean;
  fecha_ingreso: string;
  fecha_vencimiento: string | null;
  descripcion: string;
  contenido_por_presentacion: number;
  es_perecible: boolean;
}

export interface DTO_RegistrarRecepcionReposicion {
  id_reposicion: number;
  fecha_hora_recepcion: string;
  con_incidencia: boolean;
  observacion?: string;
  items: DTO_ItemRecepcionReposicion[];
}

export interface DTO_ItemRecepcionReposicion {
  id_reposicion_detalle: number;
  /** false para activos fijos */
  es_activo_fijo?: boolean;
  /** Poblado solo para activos fijos */
  id_activo_fijo?: number | null;
  /** Opcional: destino del activo devuelto */
  id_almacen_destino?: number | null;
  id_mina_destino?: number | null;

  cantidad_base: number;
  es_nuevo_lote: boolean;
  id_lote_existente?: number;
  id_unidad_medida: number; // del lote si es nuevo
  contenido_por_presentacion: number;
  descripcion?: string;
  fecha_vencimiento?: string | null;
  fecha_ingreso?: string;
}
