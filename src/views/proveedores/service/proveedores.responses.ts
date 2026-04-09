import type { EstadoBase } from "../../../shared/enums/estados";

export interface ProveedorResponse {
  id_proveedor: number;
  tipo_entidad: string;
  dni: string | null;
  ruc: string | null;
  razon_social: string;
  direccion: string | null;
  telefono: string | null;
  correo: string | null;
  estado: EstadoBase;
}

export interface BancoResponse {
  id_banco: number;
  abreviatura: string;
  nombre: string;
}

export interface CuentaBancariaResponse {
  id_cuenta_bancaria: number;
  banco_abv: string;
  banco_nombre: string;
  id_banco: number;
  moneda: string;
  numero_cuenta: string;
  cci: string | null;
  es_para_detraccion: number;
  estado: EstadoBase;
}
