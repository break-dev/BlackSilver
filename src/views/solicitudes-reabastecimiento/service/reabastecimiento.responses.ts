import type { EstadoSolicitudDetalle } from "../../../shared/enums/estados";
import type { IArchivo } from "../../../shared/interfaces";

export interface RES_SolicitudReabastecimiento {
  id_solicitud: number;
  id_almacen_solicitante: number;
  id_requerimiento_almacen: number | null;
  correlativo_requerimiento: string | null;
  almacen_solicitante: string;
  empleado_solicitante: string;
  correlativo: string;
  premura: string;
  fecha_entrega_requerida: string;
  created_at: string;
  estado: string;
}

export interface RES_SolicitudDetalle {
  id_solicitud_detalle: number;
  producto: string;
  id_unidad_medida_sol: number;
  unidad_medida_base_abv: string;
  unidad_medida_solicitud_abv: string;
  es_fiscalizado: number;
  es_perecible: number;
  cantidad_solicitada: number;
  contenido_por_presentacion: number;
  cantidad_solicitada_base: number;
  cantidad_entregada: number;
  cantidad_entregada_base: number;
  comentario: string | null;
  estado: EstadoSolicitudDetalle;
}

export interface RES_TrazabilidadEvento {
  id_trazabilidad: number;
  empleado: string | null;
  descripcion: string;
  created_at: string;
  estado: string;
}

export interface RES_Almacen_Local {
  id_almacen: number;
  nombre: string;
}

export interface RES_Producto_Local {
  id_producto: number;
  nombre: string;
  unidad_medida_base: string;
  unidad_medida_base_abv: string;
  id_unidad_medida_base: number;
}

export interface RES_Unidad_Local {
  id_unidad_medida: number;
  nombre: string;
  abreviatura: string;
}

export interface RES_DataRegistroSolicitud {
  almacenes: RES_Almacen_Local[];
  productos: RES_Producto_Local[];
  unidades_medida: RES_Unidad_Local[];
}

export interface RES_EntregaReabastecimiento {
  id_reabastecimiento_entrega: number;
  id_entrega?: number;
  id_almacen_entrega?: number;
  almacen_entrega: string;
  empleado_entrega: string;
  empleado_recibe: string;
  correlativo: string;
  fecha_hora_entrega: string;
  observacion: string | null;
  evidencias: IArchivo[] | null;
  created_at: string;
  estado: string;
  detalles?: RES_DetalleEntregaReabastecimiento[];
  // Campos adicionales para entregas de préstamos
  tipo_entrega?: "Solicitud" | "Prestamo";
  correlativo_prestamo?: string;
  id_prestamo?: number;
}

export interface RES_DetalleEntregaReabastecimiento {
  id_entrega_detalle: number;
  id_reabastecimiento_entrega: number;
  id_solicitud_reabastecimiento_detalle: number;
  correlativo: string; // del lote
  fecha_vencimiento: string | null;
  producto: string;
  es_perecible: number;
  id_unidad_medida_base: number;
  id_producto: number;
  id_unidad_medida: number; // para lote
  cantidad_base: number;
  cantidad_lote: number;
  cantidad_solicitud: number;
  unidad_lote_abv: string;
  unidad_base_abv: string;
  estado_entrega_detalle: string;
  id_unidad_medida_solicitada: number;
  tipo_entrega?: "Solicitud" | "Prestamo";
  contenido_por_presentacion_solicitado: number;
  unidad_medida_solicitud_abv: string;
  cantidad_recibida_total?: number;
}

export interface RES_LoteRecepcion {
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

export interface RecepcionDetalle {
  id_detalle: number;
  id_solicitud_reabastecimiento_entrega_detalle: number;
  producto: string;
  cantidad_recepcionada_base: number;
  unidad_base_abv: string;
  estado: string;
}

export interface RecepcionEvento {
  id_recepcion: number;
  id_solicitud_reabastecimiento_entrega: number;
  id_empleado_registro: number;
  empleado_registro: string;
  observacion: string | null;
  fecha_hora_recepcion: string;
  evidencias: IArchivo[] | null;
  con_incidencia: boolean;
  estado: string;
  detalles: RecepcionDetalle[];
}
