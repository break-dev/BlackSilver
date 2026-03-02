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
  id: number; // id_asignacion
  id_asignacion?: number; // Backend alias compatibility
  id_concesion: number;
  id_empresa: number;
  // Campos de empresa
  razon_social: string;
  nombre_comercial?: string;
  ruc: string;
  path_logo?: string;
  // Campos de asignación
  fecha_inicio: string;
  fecha_fin?: string | null;
  estado: string; // "Activo" | "Inactivo"
}
