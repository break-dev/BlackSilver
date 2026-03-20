import type { EstadoSolicitudDetalle } from "../../../shared/enums/estados";

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
  id_producto: number;
  id_unidad_medida: number; // para lote
  cantidad_base: number;
  cantidad_lote: number;
  cantidad_solicitud: number;
  unidad_lote_abv: string;
  unidad_base_abv: string;
  estado_entrega_detalle: string;
}

export interface RES_LoteRecepcion {
  id_lote: number;
  id_producto: number;
  correlativo: string;
  stock_actual: number;
  stock_actual_base: number;
  contenido_por_presentacion: number | null;
  id_unidad_medida: number;
  id_unidad_medida_base: number;
  unidad_medida: string;
  unidad_medida_abv: string;
  fecha_hora_ingreso: string;
  fecha_vencimiento: string | null;
  dias_para_vencer: number | null;
}

export interface DTO_RecibirEntregaItem {
  id_solicitud_reabastecimiento_detalle: number;
  es_nuevo_lote: boolean;
  id_lote_existente?: number | null;
  fecha_vencimiento?: string | null;
}

export interface DTO_RecibirEntregas {
  id_reabastecimiento_entrega: number;
  items: DTO_RecibirEntregaItem[];
}
