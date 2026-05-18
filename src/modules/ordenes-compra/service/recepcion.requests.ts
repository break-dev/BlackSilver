export interface DTO_RecepcionOCItem {
  id_orden_compra_detalle: number;
  cantidad_base: number;
  es_nuevo_lote: boolean;
  id_lote_existente: number | null;
  descripcion: string | null;
  fecha_vencimiento: string | null;
  fecha_ingreso: string | null;
  /** Activos fijos: true indica que es un activo, no un lote */
  es_activo_fijo?: boolean;
  /** Almacén donde queda el activo (mutuamente exclusivo con id_mina_destino) */
  id_almacen_destino?: number | null;
  /** Mina donde queda el activo (mutuamente exclusivo con id_almacen_destino) */
  id_mina_destino?: number | null;
  /** Descripción libre del activo recibido */
  descripcion_activo?: string | null;
  /** Campos específicos del activo fijo para creación directa */
  codigo?: string | null;
  numero_serie?: string | null;
  modelo?: string | null;
  id_marca?: number | null;
  yearcito_modelo?: number | null;
}

export interface DTO_OCComprobante {
  tipo_comprobante: string;
  serie: string;
  numero: string;
  fecha_emision: string;
  observacion: string | null;
  evidencias: File[];
  moneda: string;
  tipo_cambio_venta_aplicado: number;
  es_auditable: boolean;
  total_antes_igv: number;
  total_antes_igv_soles: number;
  incluye_igv: boolean;
  porcentaje_igv: number;
  monto_igv: number;
  monto_igv_soles: number;
  total_despues_igv: number;
  total_despues_igv_soles: number;
}

export interface REQ_RegistrarRecepcionOC {
  id_orden_compra: number;
  id_almacen_recepcionista: number;
  con_incidencia: boolean;
  observacion: string | null;
  fecha_hora_recepcion: string;
  serie_guia: string | null;
  numero_guia: string | null;
  items: DTO_RecepcionOCItem[];
  comprobante?: DTO_OCComprobante;
}
export interface REQ_RegistrarOCComprobante {
  id_orden_compra: number;
  tipo_comprobante: string;
  serie: string;
  numero: string;
  fecha_emision: string;
  observacion: string | null;
  moneda: string;
  tipo_cambio_venta_aplicado: number;
  es_auditable: boolean;
  total_antes_igv: number;
  total_antes_igv_soles: number;
  incluye_igv: boolean;
  porcentaje_igv: number;
  monto_igv: number;
  monto_igv_soles: number;
  total_despues_igv: number;
  total_despues_igv_soles: number;
  ids_recepciones: string; // JSON string array
}
