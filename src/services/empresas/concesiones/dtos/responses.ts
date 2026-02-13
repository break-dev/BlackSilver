export interface RES_Concesion {
  id_concesion: number;
  nombre: string;
  codigo_concesion?: string;
  codigo_reinfo?: string;
  tipo_mineral?: string;
  ubigeo?: string;
  empresas_asignadas: number;
  estado: string;

  // New field from backend for creation flow logic
  id_asignacion?: number;
}

export interface RES_Asignacion {
  id: number; // id_asignacion (pk of empresa_concesion table)
  id_concesion: number;
  id_empresa_concesion: number; // Alias for id_asignacion in some contexts
  razon_social: string;
  ruc: string;
}
