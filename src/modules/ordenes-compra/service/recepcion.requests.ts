export interface DTO_RecepcionOCItem {
  id_orden_compra_detalle: number;
  cantidad_base: number;
  es_nuevo_lote: boolean;
  id_lote_existente: number | null;
  descripcion: string | null;
  fecha_vencimiento: string | null;
  fecha_ingreso: string | null;
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
}
