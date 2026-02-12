import type { EstadoBase } from "../../../../shared/enums";

// Responses
export interface RES_Concesion {
  id_concesion: number;
  nombre: string;
  codigo_concesion?: string;
  codigo_reinfo?: string;
  ubigeo?: string;
  tipo_mineral?: "Polimetalico" | "Carbon";
  estado: EstadoBase;
  empresas_asignadas: number; // Contador
}

export interface RES_Asignacion {
  id_asignacion: number;
  id_empresa: number;
  nombre_comercial: string;
  path_logo?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  estado: string;
}
