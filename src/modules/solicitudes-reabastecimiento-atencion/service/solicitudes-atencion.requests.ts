import { Estado_SolicitudDetalle } from "../../../shared/enums/solicitud-reabastecimiento/solicitud";

export interface DTO_DecisionDetalle {
  id_solicitud_detalle?: number;
  ids_detalles?: number[];
  nuevo_estado: Estado_SolicitudDetalle;
  comentario_decision?: string;
}

export interface DTO_RegistrarEntregaReabastecimiento {
  id_solicitud: number;
  id_almacen_entrega: number;
  id_empleado_recibe?: number | null;
  fecha_hora_entrega: string;
  observacion?: string;
  evidencias?: File[];
  detalles: DTO_EntregasDetalleReabastecimiento[];
  // Transport fields
  medio_entrega: string;
  id_proveedor_transporte?: number | null;
  id_agencia_transporte?: number | null;
  numero_factura?: string | null;
  serie_factura?: string | null;
  serie_guia_transportista?: string | null;
  numero_guia_transportista?: string | null;
  serie_guia_remitente?: string | null;
  numero_guia_remitente?: string | null;
  costo_envio?: number | null;
}

export interface DTO_EntregasDetalleReabastecimiento {
  id_solicitud_detalle: number;
  /** Nulo cuando es activo fijo */
  id_lote_producto?: number | null;
  /** Poblado solo para activos fijos */
  id_activo_fijo?: number | null;
  cantidad_base: number;
  cantidad_lote: number;
  cantidad_solicitud: number;
}

export interface DTO_CrearPrestamo {
  id_solicitud_reabastecimiento: number;
  id_almacen_prestamista: number;
  es_auditable: boolean;
  fecha_limite_devolucion: string | null;
  detalles: DTO_DetallePrestamo[];
}

export interface DTO_DetallePrestamo {
  id_solicitud_reabastecimiento_detalle: number;
  cantidad_solicitada: number;
  comentario?: string;
}
