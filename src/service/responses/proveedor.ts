import type { TipoEntidad } from "../../shared/enums/_generic/tipo-entidad";

export interface RES_Proveedor {
  id_proveedor: number;
  razon_social: string;
  direccion: string | null;
  ruc: string | null;
  dni: string | null;
  tipo_entidad: TipoEntidad;
  para_mantenimiento: boolean;
}
