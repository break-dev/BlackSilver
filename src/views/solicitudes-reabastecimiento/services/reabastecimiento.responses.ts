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
  unidad_medida_base_abreviatura: string;
  unidad_medida_solicitud_abreviatura: string;
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
