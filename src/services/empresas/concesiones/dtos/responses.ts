import type { EstadoBase } from "../../../../shared/enums";

// Responses
export interface RES_Concesion {
  id_concesion: number;
  id_empresa: number;
  empresa: string;
  logo_empresa?: string;
  nombre: string;
  estado: EstadoBase;
}
