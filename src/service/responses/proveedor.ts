import type { EstadoBase } from "../../shared/enums/_generic/estado-base";
import type { TipoEntidad } from "../../shared/enums/_generic/tipo-entidad";

export interface RES_Proveedor {
  id_proveedor: number;
  razon_social: string;
  direccion: string | null;
  ruc: string | null;
  dni: string | null;
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
  estado: EstadoBase;
  cantidad_cuentas_bancarias?: number;
}