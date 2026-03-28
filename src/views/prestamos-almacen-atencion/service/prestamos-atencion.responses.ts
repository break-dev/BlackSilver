export interface RES_AlmacenAutorizado {
  id_almacen: number;
  nombre: string;
}

export interface RES_PrestamoAtencion {
  id_prestamo: number;
  correlativo: string;
  numero_correlativo: number;
  fecha_hora_prestamo: string;
  fecha_limite_devolucion: string | null;
  created_at: string;
  estado: string;
  id_almacen_prestamista: number;
  almacen_solicitante: string;
  id_almacen_solicitante: number;
  id_empleado_recibe_default: number | null;
  registrado_por: string;
  solicitud_correlativo: string;
  detalles?: RES_DetallePrestamo[];
}

export interface RES_DetallePrestamo {
  id_prestamo_detalle: number;
  id_producto: number;
  producto: string;
  id_unidad_medida: number;
  unidad_medida: string;
  unidad_medida_abv: string;
  unidad_medida_base_abv: string;
  contenido_por_presentacion: number;
  cantidad_solicitada: number;
  cantidad_solicitada_base: number;
  cantidad_prestada: number;
  cantidad_prestada_base: number;
  comentario: string | null;
  estado: string;
  stock_minimo: number;
  stock_disponible: number | null;
}

export interface RES_TrazabilidadPrestamo {
  id: number;
  estado: string;
  comentario: string | null;
  created_at: string;
  nombre_empleado: string;
  path_foto: string | null;
}

export interface RES_EntregaPrestamo {
  id_entrega: number;
  correlativo: string;
  numero_correlativo: number;
  fecha_hora_entrega: string;
  observacion: string | null;
  evidencias: string | null;
  created_at: string;
  estado: string;
  empleado_entrega: string;
  empleado_recibe: string;
  detalles?: RES_DetalleEntregaPrestamo[];
}

export interface RES_DetalleEntregaPrestamo {
  id_entrega_detalle: number;
  id_prestamo_almacen_detalle: number;
  id_producto: number;
  producto: string;
  id_lote_salida: number;
  correlativo_lote: string;
  fecha_vencimiento: string | null;
  dias_para_vencer: number | null;
  cantidad_base: number;
  cantidad_lote: number;
  unidad_medida: string;
  unidad_medida_abv: string;
  contenido_por_presentacion: number;
  comentario: string | null;
  estado: string;
}

export interface RES_LoteDisponibleDespacho {
  id_lote: number;
  id_producto: number;
  correlativo: string;
  stock_actual: number;
  stock_actual_base: number;
  contenido_por_presentacion: number;
  unidad_medida: string;
  unidad_medida_abv: string;
  fecha_vencimiento: string | null;
  dias_para_vencer: number | null;
}

export interface RES_EmpleadoPrestamo {
  id_empleado: number;
  nombre_completo: string;
  dni: string;
  path_foto: string | null;
}

export interface RES_Lote_Atencion {
  id_lote: number;
  id_producto: number;
  correlativo: string;
  stock_actual: number;
  stock_actual_base: number;
  contenido_por_presentacion: number;
  unidad_medida: string;
  unidad_medida_abv: string;
  presentacion_abv?: string; // Alias for UI if needed
  fecha_vencimiento: string | null;
  dias_para_vencer: number | null;
}

export interface RES_DetallePrestamoPorId {
  detalles: RES_DetallePrestamo[];
  entregas: RES_EntregaPrestamo[];
}

export interface RES_ReposicionPrestamo {
  id_reposicion: number;
  correlativo: string;
  fecha_hora_reposicion: string;
  created_at: string;
  estado: string;
  observacion: string | null;
  evidencias: string | null;
  almacen_entrega: string;
  registrado_por: string;
  detalles?: RES_DetalleReposicionPrestamo[];
}

export interface RES_DetalleReposicionPrestamo {
  id: number;
  cantidad_base: number;
  cantidad_lote: number;
  cantidad_solicitud: number;
  estado: string;
  producto: string;
  unidad_medida_base: string;
  lote_correlativo: string;
}

export interface RES_DetalleReposicionParaRecepcion {
  id_entrega_detalle: number;
  id_solicitud_reabastecimiento_detalle: number;
  id_reabastecimiento_entrega: number;
  cantidad_base: number;
  cantidad_lote: number;
  cantidad_solicitud: number;
  estado_entrega_detalle: string;
  id_producto: number;
  producto: string;
  es_perecible: number;
  id_unidad_medida_base: number;
  unidad_base_abv: string;
  id_unidad_medida_solicitada: number;
  contenido_por_presentacion_solicitado: number;
  unidad_medida_solicitud_abv: string;
  id_lote_origen: number;
  correlativo_lote_origen: string;
  unidad_lote_abv: string;
  id_unidad_medida_lote: number;
  fecha_vencimiento: string | null;
  tipo_entrega?: "Solicitud" | "Prestamo" | "Reposicion";
}

export interface RES_LoteRecepcionReposicion {
  id_lote: number;
  id_producto: number;
  id_unidad_medida_lote: number;
  id_unidad_medida_base: number | null;
  unidad_medida_base_abv: string | null;
  unidad_medida_lote_abv: string | null;
  descripcion: string | null;
  correlativo: string;
  stock_actual: number;
  contenido_por_presentacion: number | null;
  stock_actual_base: number;
  fecha_hora_ingreso: string;
  fecha_vencimiento: string | null;
  estado: string;
  stock_minimo: number;
  dias_espera_vencimiento: number;
  dias_para_vencer: number | null;
  estado_vencimiento: string;
}

export interface RES_UnidadMedida {
  id_unidad_medida: number;
  nombre: string;
  abreviatura: string;
}
