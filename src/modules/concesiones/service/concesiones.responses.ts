import { TipoMineral } from "../../../shared/enums/_generic/tipo-mineral";

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
