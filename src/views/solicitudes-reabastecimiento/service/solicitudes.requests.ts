import type { Premura } from "../../../shared/enums/estados";

export interface DTO_CrearSolicitudReabastecimientoDetalle {
  id_producto: number;
  id_unidad_medida: number;
  cantidad_solicitada: number;
  contenido_por_presentacion: number;
  comentario: string;
}

export interface DTO_CrearSolicitudReabastecimiento {
  id_almacen_solicitante: number;
  premura: Premura;
  observacion: string;
  fecha_hora_entrega_requerida: string;
  detalles: DTO_CrearSolicitudReabastecimientoDetalle[];
}

export interface RES_SolicitudReabastecimiento {
  id_solicitud_reabastecimiento: number;
  id_almacen_solicitante: number;
  almacen_solicitante: string;
  empleado_solicitante: string;
  correlativo: string;
  premura: string;
  fecha_hora_entrega_requerida: string;
  created_at: string;
  estado: string;
}

export interface RES_SolicitudReabastecimientoDetalle {
  id_requerimiento_almacen_detalle: number;
  id_producto: number;
  producto: string;
  id_unidad_medida: number;
  unidad_medida: string;
  es_fiscalizado: number;
  es_perecible: number;
  cantidad_solicitada: string;
  cantidad_solicitada_base: string;
  contenido_por_presentacion: string;
  cantidad_entregada: string;
  cantidad_entregada_base: string;
  comentario: string;
  estado: string;
}

export interface RES_SolicitudDetalleCompleto extends RES_SolicitudReabastecimiento {
  detalles: RES_SolicitudReabastecimientoDetalle[];
}
