import { EstadoSolicitudDetalle } from "../../../shared/enums/estados";

export interface DTO_DecisionDetalle {
  id_solicitud_detalle?: number;
  ids_detalles?: number[];
  nuevo_estado: EstadoSolicitudDetalle;
  comentario_decision?: string;
}

export interface DTO_RegistrarEntregaReabastecimiento {
  id_solicitud: number;
  id_almacen_entrega: number;
  id_empleado_recibe: number;
  fecha_hora_entrega: string;
  observacion?: string;
  evidencias?: File[];
  detalles: DTO_EntregasDetalleReabastecimiento[];
}

export interface DTO_EntregasDetalleReabastecimiento {
  id_solicitud_detalle: number;
  id_lote_producto: number;
  cantidad_base: number;
  cantidad_lote: number;
  cantidad_solicitud: number;
}

export interface DTO_CrearPrestamo {
  id_solicitud_reabastecimiento: number;
  id_almacen_prestamista: number;
  fecha_limite_devolucion: string | null;
  detalles: DTO_DetallePrestamo[];
}

export interface DTO_DetallePrestamo {
  id_solicitud_reabastecimiento_detalle: number;
  cantidad_solicitada: number;
  comentario?: string;
}
