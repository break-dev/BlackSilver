import { EstadoSolicitudDetalle } from "../../../shared/enums/estados";

export interface DTO_DecisionDetalle {
  id_solicitud_detalle: number;
  nuevo_estado: EstadoSolicitudDetalle;
  comentario_decision?: string;
}

export interface DTO_RegistrarEntregaReabastecimiento {
  id_solicitud: number;
  id_almacen_entrega: number;
  id_empleado_recibe: number;
  fecha_hora_entrega: string;
  observacion?: string;
  detalles: DTO_EntregasDetalleReabastecimiento[];
}

export interface DTO_EntregasDetalleReabastecimiento {
  id_solicitud_detalle: number;
  id_lote_producto: number;
  cantidad_base: number;
  cantidad_lote: number;
  cantidad_solicitud: number;
}
