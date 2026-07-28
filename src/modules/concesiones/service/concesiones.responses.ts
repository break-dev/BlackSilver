import type { EstadoBase } from "../../../shared/enums/_generic/estado-base";
import { TipoMineral } from "../../../shared/enums/_generic/tipo-mineral";
import type { IArchivo } from "../../../shared/interfaces/archivo";

export interface RES_Concesion {
  id_concesion: number;
  nombre: string;
  codigo_reinfo: string | null;
  ubigeo: string | null;
  tipo_mineral: TipoMineral | string;
  estado: EstadoBase;
  contratos_activos: number;
  contratos: RES_Contrato[];
}

export interface RES_Contrato {
  id_contrato: number;
  id_empresa: number;
  razon_social: string;
  ruc: string;
  url_logo: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: EstadoBase;
  evidencias: IArchivo[];
}