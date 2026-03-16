export interface DTO_CrearSolicitud {
  id_almacen_solicitante: number;
  premura: string;
  observacion?: string;
  fecha_entrega_requerida: string;
  detalles: DTO_SolicitudDetalle[];
}

export interface DTO_SolicitudDetalle {
  id_producto: number;
  id_unidad_medida: number;
  cantidad_solicitada: number;
  contenido_por_presentacion: number;
  comentario?: string;
}
