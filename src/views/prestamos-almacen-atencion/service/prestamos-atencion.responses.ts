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
  almacen_solicitante: string;
  id_almacen_solicitante: number;
  registrado_por: string;
  detalles?: RES_DetallePrestamo[];
}

export interface RES_DetallePrestamo {
  id_prestamo_detalle: number;
  id_producto: number;
  producto: string;
  unidad_medida: string;
  unidad_medida_abv: string;
  contenido_por_presentacion: number;
  cantidad_solicitada: number;
  cantidad_solicitada_base: number;
  comentario: string | null;
  estado: string;
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
  cantidad: number;
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

export interface RES_DetallePrestamoPorId {
  detalles: RES_DetallePrestamo[];
  entregas: RES_EntregaPrestamo[];
}
