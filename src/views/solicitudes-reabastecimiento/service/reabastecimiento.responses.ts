import type { EstadoSolicitudDetalle } from "../../../shared/enums/estados";
import type { IArchivo } from "../../../shared/interfaces";
import type { RES_Almacen } from "../../../service/responses/almacen";
import type { RES_UnidadMedida } from "../../../service/responses/unidad-medida";
export type { RES_Almacen, RES_UnidadMedida };

export interface RES_SolicitudReabastecimiento {
  id_solicitud: number;
  id_almacen_solicitante: number;
  id_requerimiento_almacen: number | null;
  correlativo_requerimiento: string | null;
  almacen_solicitante: string;
  solicitante: string;
  correlativo: string;
  premura: string;
  fecha_entrega_requerida: string;
  created_at: string;
  estado: string;
}

export interface RES_SolicitudDetalle {
  id_solicitud_detalle: number;
  empleado_atencion: string | null;
  id_producto: number;
  producto: string;
  stock_minimo: number;
  id_unidad_medida_base: number;
  unidad_medida_base_abv: string;
  cantidad_solicitada_base: number;
  cantidad_entregada_base: number;
  contenido_por_presentacion: number;
  id_unidad_medida_sol: number;
  unidad_medida_sol_abv: string;
  cantidad_solicitada: number;
  cantidad_entregada: number;
  porcentaje_progreso: number;
  comentario: string | null;
  comentario_decision: string | null;
  estado: EstadoSolicitudDetalle;
}

export interface RES_TrazabilidadEvento {
  id_trazabilidad: number;
  empleado: string | null;
  descripcion: string;
  created_at: string;
  estado: string;
}

export interface RES_Producto_Local {
  id_producto: number;
  nombre: string;
  unidad_medida_base: string;
  unidad_medida_base_abv: string;
  id_unidad_medida_base: number;
}

export interface RES_DataRegistroSolicitud {
  almacenes: RES_Almacen[];
  productos: RES_Producto_Local[];
  unidades_medida: RES_UnidadMedida[];
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

export interface RES_HistorialEntregas {
  logistica: RES_EntregaReabastecimiento[];
  prestamo: RES_EntregaReabastecimiento[];
}

export interface RES_DetalleEntregaReabastecimiento {
  id_entrega_detalle: number;
  id_reabastecimiento_entrega: number;
  id_solicitud_reabastecimiento_detalle: number;
  lote_correlativo: string; // nombre real del campo
  fecha_vencimiento: string | null;
  producto: string;
  es_perecible: number;
  id_unidad_medida_base: number;
  id_producto: number;
  id_unidad_medida: number; // para lote
  cantidad_base: number;
  cantidad_lote: number;
  cantidad_solicitud: number;
  unidad_medida_lot_abv: string; // nombre real del campo
  unidad_medida_base_abv: string; // nombre real del campo
  estado: string; // nombre real del campo en el API
  estado_entrega_detalle: string; // para uso interno en el front
  id_unidad_medida_solicitada: number;
  tipo_entrega?: "Solicitud" | "Prestamo";
  contenido_por_presentacion_solicitado: number;
  unidad_medida_solicitud_abv: string;
  cantidad_recibida_total_base: number; // nombre real del campo
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
