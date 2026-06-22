import type { EstadoBase } from "../../../shared/enums/_generic/estado-base";

export interface ClienteResponse {
  id_cliente: number;
  tipo_entidad: string | null;
  dni: string | null;
  ruc: string | null;
  razon_social: string;
  direccion: string | null;
  telefono: string | null;
  correo: string | null;
  estado: EstadoBase;
  created_at: string;
  cantidad_cuentas_bancarias: number;
}

export interface CuentaBancariaResponse {
  id_cuenta_bancaria: number;
  banco: string;
  banco_abv: string;
  moneda: string;
  numero_cuenta: string;
  cci: string | null;
  es_para_detraccion: number;
  estado: EstadoBase;
}
