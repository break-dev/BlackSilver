import {
  EstadoSolicitud,
  EstadoSolicitudDetalle,
  EstadoVencimiento,
} from "../../../shared/enums/estados";
import { Premura } from "../../../shared/enums/otros";

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
  stock_disponible: number;
  comentario: string | null;
  comentario_decision: string | null;
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
  id_almacen_entrega: number;
  almacen_entrega: string;
  empleado_entrega: string;
  empleado_recibe: string;
  correlativo: string;
  fecha_hora_entrega: string;
  observacion: string | null;
  evidencias: string | null;
  created_at: string;
  estado: string;
  detalles?: RES_DetalleEntregaReabastecimiento[];
}

export interface RES_DetalleEntregaReabastecimiento {
  id_entrega_detalle: number;
  id_solicitud_reabastecimiento_detalle: number;
  correlativo: string; // del lote
  fecha_vencimiento: string | null;
  producto: string;
  dias_para_vencer: number | null;
  estado_vencimiento: EstadoVencimiento;
  cantidad_base: number;
  cantidad_lote: number;
  cantidad_solicitud: number;
  id_unidad_medida_lote: number;
  id_unidad_medida_base: number;
  unidad_lote: string;
  unidad_lote_abv: string;
  unidad_base: string;
  unidad_base_abv: string;
}

export interface RES_LoteReabastecimiento {
  id_lote: number;
  id_producto: number;
  correlativo: string;
  stock_actual: number;
  stock_actual_base: number;
  contenido_por_presentacion: number;
  id_unidad_medida: number;
  id_unidad_medida_base: number;
  unidad_medida: string;
  unidad_medida_abv: string;
  fecha_hora_ingreso: string;
  fecha_vencimiento: string | null;
  dias_para_vencer: number | null;
  estado_vencimiento?: EstadoVencimiento;
}

export interface RES_Almacen {
  id_almacen: number;
  nombre: string;
  es_principal: number | boolean;
}

export interface RES_Empleado {
  id_empleado: number;
  nombre_completo: string;
  dni: string;
  path_foto: string | null;
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

export interface RES_AlmacenConStock {
  id_almacen: number;
  nombre_almacen: string;
  stock_actual_base: number;
  unidad_medida_base: string;
}

export interface RES_LoteDisponiblePrestamo {
  id_lote: number;
  lote: string;
  correlativo: string;
  numero_correlativo: number;
  stock_actual: number;
  stock_actual_base: number;
  unidad_medida: string;
  fecha_vencimiento: string | null;
}
