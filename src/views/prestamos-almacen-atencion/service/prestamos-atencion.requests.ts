export interface DTO_RegistrarDespacho {
  id_prestamo: number;
  id_empleado_recibe: number;
  fecha_hora_entrega: string;
  observacion?: string;
  detalles: DTO_DetalleDespacho[];
}

export interface DTO_DetalleDespacho {
  id_prestamo_detalle: number;
  id_lote_salida: number;
  cantidad: number;
  cantidad_base: number;
}
