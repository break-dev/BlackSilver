import type { EstadoBase } from "../../../shared/enums/_generic/estado-base";
import type { Moneda } from "../../../shared/enums/_generic/moneda";
import type { TipoEntidad } from "../../../shared/enums/_generic/tipo-entidad";

export interface ProveedorResponse {
  id_proveedor: number;
  tipo_entidad: TipoEntidad;
  para_mantenimiento: boolean;
  para_transporte: boolean;
  para_carbon: boolean;
  id_departamento: number | null;
  id_provincia: number | null;
  id_distrito: number | null;
  departamento_nombre: string | null;
  provincia_nombre: string | null;
  distrito_nombre: string | null;
  dni: string | null;
  ruc: string | null;
  razon_social: string;
  direccion: string | null;
  telefono: string | null;
  correo: string | null;
  estado: EstadoBase;
  cantidad_cuentas_bancarias: number;
  cuentas_bancarias?: CuentaBancariaResponse[];
  cantidad_tipos_carbon: number;
  tipos_carbon?: TipoCarbonProveedorResponse[];
}

export interface CuentaBancariaResponse {
  id_cuenta_bancaria: number;
  banco_abv: string;
  banco: string;
  id_banco: number;
  moneda: Moneda;
  numero_cuenta: string;
  cci: string | null;
  es_para_detraccion: boolean;
  estado: EstadoBase;
}

export interface TipoCarbonProveedorResponse {
  id_tipo_carbon: number;
  nombre: string;
  codigo: string | null;
}