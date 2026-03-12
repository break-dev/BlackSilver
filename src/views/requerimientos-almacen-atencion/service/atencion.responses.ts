import {
    EstadoRequerimiento,
    EstadoDetalleRequerimiento,
    EstadoVencimiento
} from "../../../shared/enums/estados";
import { Premura } from "../../../shared/enums/otros";

/**
 * Representa un requerimiento en el resumen de atención
 */
export interface RES_RequerimientoAlmacen {
    id_requerimiento: number;
    id_almacen_destino: number;
    correlativo: string;
    observacion: string | null;
    mina: string;
    solicitante: string;
    premura: Premura;
    fecha_entrega_requerida: string | null;
    estado: EstadoRequerimiento;
    created_at: string;
}

/**
 * Representa un item de detalle de un requerimiento
 */
export interface RES_DetalleRequerimiento {
    id_requerimiento_almacen_detalle: number;
    id_producto: number;
    empleado_atencion: string | null;
    producto: string;
    unidad_medida_base: string;
    unidad_medida: string;
    contenido_por_presentacion: number;
    cantidad_solicitada: number;
    cantidad_solicitada_base: number;
    cantidad_entregada: number;
    cantidad_entregada_base: number;
    porcentaje_progreso: number;
    comentario: string | null;
    comentario_decision: string | null;
    estado: EstadoDetalleRequerimiento;
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
    fecha_hora_entrega: number;
    observacion: string | null;
    evidencias: string | null;
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
    fecha_vencimiento: string | null;
    dias_para_vencer: number | null;
    estado_vencimiento: EstadoVencimiento;
    cantidad_base: number;
    cantidad_lote: number;
    cantidad_requerimiento: number;
    unidad_lote: string;
    unidad_lote_abv: string;
}

/**
 * Representante de un lote disponible en almacén
 */
export interface RES_Lote {
    id_lote: number;
    correlativo: string;
    stock_actual: number;
    stock_actual_base: number;
    contenido_por_presentacion: number;
    unidad_medida: string;
    unidad_medida_abv: string;
    fecha_hora_ingreso: string;
    fecha_vencimiento: string | null;
    dias_para_vencer: number | null;
    estado_vencimiento: EstadoVencimiento;
}

/**
 * Referencia local para empleados
 */
export interface RES_Empleado {
    id_empleado: number;
    nombre_completo: string;
    dni: string;
    path_foto: string | null;
}
