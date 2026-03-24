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
