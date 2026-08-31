import type { IArchivo } from "../../../shared/interfaces/archivo";

export interface CrearCompraCarbonDetalle {
  id_tipo_carbon: number;
  id_transportista?: number | null;
  id_lugar_extraccion?: number | null;
  id_tarifa_carbon?: number | null;
  placa?: string | null;
  guia_remitente?: string | null;
  guia_transportista?: string | null;
  pagar_flete: boolean;
  codigo_ticket_balanza?: string | null;
  cantidad: number;
  porcentaje_ceniza?: number;
  porcentaje_humedad?: number;
  precio_unitario: number;
  costo_flete_por_tonelada?: number;
  evidencias?: IArchivo[] | null;
}

export interface CrearCompraCarbonRequest {
  id_empresa: number;
  id_proveedor: number;
  id_almacen: number;
  aplica_igv: boolean;
  porcentaje_igv: number;
  fecha_hora_ingreso: string;
  /** Evidencias a nivel de cabecera (subidas al storage por la UI). */
  evidencias?: IArchivo[] | null;
  detalles: CrearCompraCarbonDetalle[];
}
