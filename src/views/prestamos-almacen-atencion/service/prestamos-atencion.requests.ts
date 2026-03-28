export interface DTO_RegistrarEntrega {
  id_prestamo: number;
  id_empleado_recibe: number;
  fecha_hora_entrega?: string;
  observacion?: string;
  detalles: DTO_DetalleEntrega[];
}

export interface DTO_DetalleEntrega {
  id_prestamo_detalle: number;
  id_lote_salida: number;
  cantidad_lote: number; // Cantidad en la unidad del Lote
  cantidad_base: number; // Cantidad en la unidad Base
  cantidad_solicitud: number; // Cantidad en la unidad de la Solicitud Reabastecimiento
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
}
