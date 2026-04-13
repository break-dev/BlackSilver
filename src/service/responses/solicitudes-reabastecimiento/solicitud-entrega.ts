import type {
  Estado_SolicitudEntrega,
  Estado_SolicitudEntregaDetalle,
} from "../../../shared/enums/solicitud-reabastecimiento/solicitud-entrega";
import type { IArchivo } from "../../../shared/interfaces/archivo";

export interface RES_SolicitudEntrega {
  id_reabastecimiento_entrega: number;
  id_solicitud_reabastecimiento: number;
  //
  id_almacen_entrega: number;
  almacen_entrega: string;
  //
  empleado_entrega: string;
  empleado_recibe: string;
  //
  correlativo: string;
  fecha_hora_entrega: string;
  observacion: string | null;
  evidencias: IArchivo[] | null;
  created_at: string;
  estado: Estado_SolicitudEntrega;
  // Datos insertados por la api
  detalles?: RES_SolicitudEntregaDetalle[];
}

export interface RES_SolicitudEntregaDetalle {
  id_entrega_detalle: number;
  id_reabastecimiento_entrega: number;
  id_solicitud_reabastecimiento_detalle: number;
  //
  id_producto: number;
  producto: string;
  //
  id_lote_producto: number;
  lote_correlativo: string;
  //
  id_unidad_medida_base: number;
  unidad_medida_base_abv: string;
  cantidad_base: number;
  //
  id_unidad_medida_lot: number;
  unidad_medida_lot_abv: string;
  contenido_por_presentacion_lot: number;
  cantidad_lote: number;
  //
  id_unidad_medida_sol: number;
  unidad_medida_sol_abv: string;
  contenido_por_presentacion_sol: number;
  cantidad_solicitud: number;
  //
  cantidad_recibida_total_base: number;
  //
  estado: Estado_SolicitudEntregaDetalle;
}
