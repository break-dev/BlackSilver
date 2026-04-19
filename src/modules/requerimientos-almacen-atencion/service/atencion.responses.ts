import type { RES_Almacen } from "../../../service/responses/almacen";
import type { RES_UnidadMedida } from "../../../service/responses/unidad-medida";
import type { EstadoVencimientoProducto } from "../../../shared/enums/_generic/estado-vencimiento-producto";
import { Premura } from "../../../shared/enums/_generic/premura";
import type {
  Estado_Requerimiento,
  Estado_RequerimientoDetalle,
} from "../../../shared/enums/requerimiento-almacen/requerimiento";
import type { IArchivo } from "../../../shared/interfaces/archivo";

// Interfaces Locales para Catálogos (Aislamiento BFF)
export interface RES_Mina {
  id_mina: number;
  nombre: string;
}

export interface RES_Labor {
  id_labor: number;
  nombre: string;
  correlativo: string;
  estado: string;
}

export interface RES_EmpleadoSimple {
  id_empleado: number;
  empleado: string;
}

export interface RES_DataByAlmacen {
  minas: RES_Mina[];
}

export interface RES_DataByMinaAtencion {
  responsables: RES_EmpleadoSimple[];
  labores: RES_Labor[];
}

export interface RES_Producto {
  id_producto: number;
  id_unidad_medida_base: number;
  nombre: string;
  unidad_medida_base_abv: string;
  unidad_medida_base: string;
  id_categoria: number;
  es_consumible: boolean;
  ids_categorias_consumidoras: string | null; // Viene como "1,2,3" desde PHP GROUP_CONCAT
}

export interface RES_DataRegistro {
  almacenes?: RES_Almacen[];
  productos: RES_Producto[];
  unidades: RES_UnidadMedida[];
}

/**
 * Representa un requerimiento en el resumen de atención
 */
export interface RES_RequerimientoAlmacen {
  id_requerimiento: number;
  //
  id_almacen_destino: number;
  almacen_destino: string;
  //
  id_empleado_solicitante: number;
  solicitante: string;
  responsable: string;
  //
  id_mina: number;
  mina: string;
  //
  correlativo: string;
  evidencias: IArchivo[] | null;
  observacion: string | null;
  premura: Premura;
  fecha_entrega_requerida: string | null;
  estado: Estado_Requerimiento;
  created_at: string;
  // Insertado por la api
  labores?: RES_Labor[];
  detalles?: RES_DetalleRequerimiento[];
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
  estado: Estado_RequerimientoDetalle;
}

/**
 * Representa un item de detalle con campos adicionales calculados para la UI
 */
export interface DetalleRequerimientoExtendido extends RES_DetalleRequerimiento {
  pendiente_base: number;
  equivReq: number;
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
  estado_vencimiento: EstadoVencimientoProducto;
  cantidad_base: number;
  cantidad_lote: number;
  cantidad_requerimiento: number;
  unidad_lote: string;
  unidad_lote_abv: string;
  unidad_base: string;
  unidad_base_abv: string;
}
