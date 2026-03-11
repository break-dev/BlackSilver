import { TipoMineral } from "../../../shared/enums/tipos";

export interface RES_Concesion {
  id_concesion: number;
  nombre: string;
  codigo_concesion: string;
  codigo_reinfo: string | null;
  ubigeo: string | null;
  tipo_mineral: TipoMineral | string;
  estado: string;
  contratos_activos: number;
}

export interface RES_Contrato {
  id_contrato: number;
  id_empresa: number;
  nombre_comercial: string;
  ruc: string;
  path_logo: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: string;
}

export interface RES_Empresa {
  id_empresa: number;
  ruc: string;
  nombre_comercial: string;
  razon_social: string;
  path_logo: string | null;
}
