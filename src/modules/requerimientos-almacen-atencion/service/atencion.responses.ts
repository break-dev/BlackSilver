import {
  EstadoRequerimiento,
  EstadoDetalleRequerimiento,
  EstadoVencimiento,
} from "../../../shared/enums/estados";
import { Premura } from "../../../shared/enums/otros";
import type { IArchivo } from "../../../shared/interfaces/menu-navegacion";

export interface RES_Empleado {
  id_empleado: number;
  nombre_completo: string;
  dni: string;
  path_foto: string | null;
}

export interface RES_Lote {
  id_lote: number;
  id_producto: number;
  correlativo: string;
  stock_actual: number;
  stock_actual_base: number;
  contenido_por_presentacion: number;
  id_unidad_medida_base: number;
  unidad_medida_base: string;
  unidad_medida_base_abv: string;
  id_unidad_medida_lote: number;
  unidad_medida_lote: string;
  unidad_medida_lote_abv: string;
  unidad_medida_abv?: string; // Alias para compatibilidad
  fecha_hora_ingreso: string;
  fecha_vencimiento: string | null;
  dias_para_vencer: number | null;
  estado_vencimiento: string;
}

export interface RES_LaborRelacionada {
  id_labor: number;
  nombre: string;
  correlativo: string;
}

/**
 * Representa un requerimiento en el resumen de atención
 */
export interface RES_RequerimientoAlmacen {
  id_requerimiento: number;
  id_almacen_destino: number;
  correlativo: string;
  observacion: string | null;
  mina: string;
  id_empleado_solicitante: number;
  solicitante: string;
  premura: Premura;
  fecha_entrega_requerida: string | null;
  estado: EstadoRequerimiento;
  created_at: string;
  labores?: RES_LaborRelacionada[];
}

/**
 * Representa un item de detalle de un requerimiento
 */
export interface RES_DetalleRequerimiento {
  id_requerimiento_almacen_detalle: number;
  id_producto: number;
  id_unidad_medida_base: number;
  unidad_medida_base_abv: string;
  id_unidad_medida_req: number;
  unidad_medida_req_abv: string;
  empleado_atencion: string | null;
  producto: string;
  stock_minimo: number;
  stock_disponible_base: number;
  contenido_por_presentacion: number;
  cantidad_solicitada: number;
  cantidad_solicitada_base: number;
  cantidad_entregada: number;
  cantidad_entregada_base: number;
  porcentaje_progreso: number;
  id_producto_destino: number | null;
  producto_destino: string | null;
  comentario: string | null;
  comentario_decision: string | null;
  estado: EstadoDetalleRequerimiento;
}

/**
 * Representa un item de detalle con campos adicionales calculados para la UI
 */
export interface DetalleRequerimientoExtendido extends RES_DetalleRequerimiento {
  pendiente_base: number;
  equivReq: number;
}

/**
 * La trazabilidad de un detalle de requerimiento (Logs)
 */
export interface RES_Trazabilidad {
  id_requerimiento_almacen_detalle_log: number;
  empleado: string | null;
  descripcion: string;
  created_at: string;
  estado: string;
}

/**
 * Representa una entrega de materiales
 */
export interface RES_Entrega {
  id_requerimiento_almacen_entrega: number;
  empleado_entrega: string;
  empleado_recibe: string;
  correlativo: string;
  fecha_hora_entrega: string;
  observacion: string | null;
  evidencias: IArchivo[] | null;
  created_at: string;
  estado: string;
  cantidad: number;
}

/**
 * El detalle técnico de lo entregado (por lote)
 */
export interface RES_DetalleEntrega {
  id_entrega_detalle: number;
  id_requerimiento_almacen_detalle: number;
  correlativo: string; // del lote
  producto: string;
  fecha_vencimiento: string | null;
  dias_para_vencer: number | null;
  estado_vencimiento: EstadoVencimiento;
  cantidad_base: number;
  cantidad_lote: number;
  cantidad_requerimiento: number;
  unidad_lote: string;
  unidad_lote_abv: string;
  unidad_base: string;
  unidad_base_abv: string;
}
