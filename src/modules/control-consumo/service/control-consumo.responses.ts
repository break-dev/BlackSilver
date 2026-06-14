import type { TipoBien } from "../../../shared/enums/_generic/tipo-bien";
import type { Estado_ConsumoDetalleEntregaReq } from "../../../shared/enums/requerimiento-almacen/requerimiento-entrega";

/**
 * Representa el detalle individual de un consumo registrado para una entrega de requerimiento.
 */
export interface RES_Consumo {
  /** ID único del registro de consumo */
  id_consumo: number;
  /** ID de la entrega del requerimiento (detalle) asociada */
  id_requerimiento_almacen_entrega_detalle: number;
  /** ID del activo fijo que consume lo entregado */
  id_activo_fijo_consumidor: number | null;
  /** ID de la labor de destino */
  id_labor_destino: number | null;
  /** ID del empleado que registró el consumo */
  id_empleado_registro: number;
  /** Nombre completo del empleado que registró el consumo */
  empleado_registro: string;
  /** Cantidad consumida medida en la Unidad de Medida Base */
  cantidad_base_consumida: number;
  /** Fecha y hora en la que se realizó el consumo físico */
  fecha_hora_consumo: string;
  /** Comentario o justificación del consumo registrado */
  comentario_consumo: string | null;
  /** Fecha y hora de creación del registro en el sistema */
  created_at: string;
  /** Estado del consumo (Consumo Parcial o Consumo Total) */
  estado: Estado_ConsumoDetalleEntregaReq;
  // Nuevos campos
  correlativo_lote_mineral?: string | null;
  labores_destinos?: string | null;
  id_labores?: string | null;
  para_mantenimiento?: boolean | number;
  para_produccion?: boolean | number;
  id_lote_mineral?: number | null;
}

/**
 * Representa un registro de todas las entregas realizadas en los requerimientos de almacen
 */
export interface RES_ResumenEntregasReq {
  /** ID único del detalle de la entrega */
  id_entrega_requerimiento_detalle: number;
  /** ID único del requerimiento de almacén */
  id_requerimiento_almacen: number;
  /** Código correlativo/número de requerimiento */
  correlativo_requerimiento: string | number;
  /** Fecha de creación del requerimiento */
  fecha_requerimiento: string;
  /** Indica si el requerimiento es auditable por el sistema */
  es_auditable: boolean | number;
  /** ID del contratista o empleado solicitante */
  id_contratista_solicitante: number;
  /** Nombre del contratista o empleado solicitante */
  contratista_solicitante: string;
  /** ID de la mina de destino */
  id_mina: number;
  /** Nombre de la mina de destino */
  mina: string;
  /** ID del almacén que atendió la entrega */
  id_almacen_destino: number;
  /** Nombre del almacén de destino */
  almacen_destino: string;
  /** Nombre del producto entregado */
  producto: string;
  /** ID de la unidad de medida base del producto */
  id_unidad_medida_base: number;
  /** Nombre de la unidad de medida base */
  unidad_medida_base: string;
  /** Abreviatura de la unidad de medida base */
  unidad_medida_base_abv: string;
  /** ID de la unidad de medida utilizada en el requerimiento */
  id_unidad_medida_req: number;
  /** Nombre de la unidad de medida del requerimiento */
  unidad_medida_req: string;
  /** Abreviatura de la unidad de medida del requerimiento */
  unidad_medida_req_abv: string;
  /** Cantidad total solicitada en la Unidad de Medida Base */
  es_consumible: boolean;
  tipo_bien: TipoBien;
  cantidad_solicitada_base: number;
  /** Cantidad solicitada en la unidad original del requerimiento */
  cantidad_solicitada: number;
  /** ID de la cabecera de la entrega realizada */
  id_requerimiento_almacen_entrega: number;
  /** Fecha y hora del registro de la entrega */
  fecha_hora_entrega: string;
  /** Cantidad total entregada en la Unidad de Medida Base */
  cantidad_entregada_base: number;
  /** Cantidad entregada en la unidad original del requerimiento */
  cantidad_entregada_req: number;
  /** Cantidad total consumida acumulada hasta el momento en la Unidad de Medida Base */
  cantidad_consumida_base: number;
  /**
   * Estado de consumo calculado dinámicamente en el cliente.
   * (Nota: No es retornado por la API, es calculado a nivel del cliente en base a cantidades)
   */
  estado_consumo?: "Sin Consumir" | "Consumo Parcial" | "Total";
  /** Historial cronológico de consumos individuales realizados sobre este detalle de entrega */
  consumos: RES_Consumo[];
}
