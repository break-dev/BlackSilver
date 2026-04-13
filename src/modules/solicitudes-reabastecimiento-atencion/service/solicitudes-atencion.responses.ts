import {
  EstadoSolicitud,
  EstadoSolicitudDetalle,
} from "../../../shared/enums/estados";
import { Premura } from "../../../shared/enums/otros";
import type { IArchivo } from "../../../shared/interfaces/menu-navegacion";

export interface RES_SolicitudReabastecimiento {
  id_solicitud: number;
  id_almacen_solicitante: number;
  id_requerimiento_almacen: number | null;
  almacen_solicitante: string;
  correlativo: string;
  correlativo_requerimiento: string | null;
  observacion: string | null;
  id_empleado_solicitante: number;
  solicitante: string;
  empleado_solicitante?: string; // Mantener por compatibilidad si es necesario en otros sitios, pero usar solicitante
  premura: Premura;
  fecha_entrega_requerida: string | null;
  estado: EstadoSolicitud;
  created_at: string;
}

export interface RES_DetalleSolicitud {
  id_solicitud_detalle: number;
  empleado_atencion: string | null;
  id_producto: number;
  id_unidad_medida_base: number;
  id_unidad_medida_sol: number;
  producto: string;
  stock_minimo: number;
  unidad_medida_base_abv: string;
  unidad_medida_sol_abv: string;
  contenido_por_presentacion: number;
  cantidad_solicitada: number;
  cantidad_solicitada_base: number;
  cantidad_entregada: number;
  cantidad_entregada_base: number;
  porcentaje_progreso: number;
  stock_disponible_base: number;
  cantidad_prestada_total_base: number;
  comentario: string | null;
  comentario_decision: string | null;
  producto_destino: string | null;
  estado: EstadoSolicitudDetalle;
}

export interface DetalleSolicitudExtendido extends RES_DetalleSolicitud {
  pendiente_base: number;
}

export interface RES_DetalleLog {
  id_solicitud_detalle_log: number;
  empleado: string | null;
  descripcion: string;
  created_at: string;
  estado: string;
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
  id_prestamo_entrega?: number; // Campo natural del API de préstamos
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
  es_perecible?: number;
  id_unidad_medida_base: number;
  id_producto: number;
  id_unidad_medida?: number; // para lote
  id_unidad_medida_lote: number; // compatible con el anterior
  cantidad_base: number | string;
  cantidad_lote: number | string;
  cantidad_solicitud: number | string;
  unidad_lote?: string;
  unidad_medida_lot_abv: string; // nombre real del campo
  unidad_base?: string;
  unidad_medida_base_abv: string; // nombre real del campo
  estado: string; // nombre real del campo en el API
  estado_entrega_detalle?: string; // para uso interno en el front
  id_unidad_medida_solicitada?: number;
  tipo_entrega?: "Solicitud" | "Prestamo";
  contenido_por_presentacion_solicitado?: number;
  unidad_medida_solicitud_abv?: string;
  cantidad_recibida_total_base?: number | string; // nombre real del campo
  // Campos naturales del API de préstamos
  id_prestamo_almacen_entrega?: number;
  id_prestamo_almacen_detalle?: number;
  cantidad_prestamo?: number | string;
  cantidad_lot?: number | string;
  id_unidad_medida_pr?: number;
  unidad_medida_pr_abv?: string;
  contenido_por_presentacion_pr?: number;
  id_lote_producto?: number;
}

export interface RES_Prestamo {
  id: number;
  id_solicitud_reabastecimiento: number;
  id_almacen_prestamista: number;
  correlativo: string;
  numero_correlativo: number;
  fecha_hora_prestamo: string;
  fecha_limite_devolucion: string;
  created_at: string;
  estado: string;
  almacen_prestamista: string;
  registrado_por: string;
  detalles?: RES_DetallePrestamo[];
}

export interface RES_DetallePrestamo {
  id: number;
  id_prestamo_almacen: number;
  id_solicitud_reabastecimiento_detalle: number;
  cantidad_solicitada: number;
  cantidad_solicitada_base: number;
  cantidad_prestada: number;
  cantidad_prestada_base: number;
  cantidad_repuesta: number;
  cantidad_repuesta_base: number;
  comentario: string | null;
  estado: string;
  producto: string;
  unidad_medida: string;
}

export interface RES_StockTotalAlmacen {
  id_producto: number;
  stock_minimo: number;
  stock_total_base: number;
}
