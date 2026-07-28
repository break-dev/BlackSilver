import type { EstadoBase } from "../../../shared/enums/_generic/estado-base";
import type { Moneda } from "../../../shared/enums/_generic/moneda";
import type { TipoEntidad } from "../../../shared/enums/_generic/tipo-entidad";

export interface ProveedorResponse {
  id_proveedor: number;
  tipo_entidad: TipoEntidad;
  para_mantenimiento: boolean;
  para_transporte: boolean;
  dni: string | null;
  ruc: string | null;
  razon_social: string;
  direccion: string | null;
  telefono: string | null;
  correo: string | null;
  cantidad_cuentas_bancarias: number;
  estado: EstadoBase;
  cuentas_bancarias?: CuentaBancariaResponse[];
}

export interface CuentaBancariaResponse {
  id_cuenta_bancaria: number;
  banco_abv: string;
  banco: string;
  id_banco: number;
  moneda: Moneda; // MONEDAS
  numero_cuenta: string;
  cci: string | null;
  es_para_detraccion: boolean;
  estado: EstadoBase;
}
