export interface DTO_CrearSolicitud {
  id_almacen_solicitante: number;
  premura: string;
  observacion?: string;
  fecha_entrega_requerida: string | null;
  detalles: DTO_SolicitudDetalle[];
}

export interface DTO_SolicitudDetalle {
  id_producto: number;
  id_unidad_medida: number;
  cantidad_solicitada: number;
  contenido_por_presentacion: number;
  comentario?: string;
}

export interface DTO_RecibirEntregaItem {
  id_solicitud_reabastecimiento_detalle: number;
  id_entrega_detalle: number | null; // Nuevo: para vincular con el detalle de la entrega
  es_nuevo_lote: boolean;
  cantidad_base: number; // Nueva: permite desglosar cantidades
  id_lote_existente?: number | null;
  fecha_vencimiento?: string | null;
  id_unidad_medida?: number | null;
  contenido_por_presentacion?: number | null;
  descripcion?: string | null;
  fecha_ingreso?: string | null;
  max_permitido?: number;
  es_perecible: boolean;
}

export interface DTO_RegistrarRecepcion {
  id_reabastecimiento_entrega: number;
  tipo_entrega: "Solicitud" | "Prestamo";
  con_incidencia: boolean;
  observacion?: string | null;
  fecha_hora_recepcion: string;
  items: DTO_RecibirEntregaItem[];
}
