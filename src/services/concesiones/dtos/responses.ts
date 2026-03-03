export interface RES_Concesion {
  id_concesion: number;
  nombre: string;
  codigo_concesion?: string;
  codigo_reinfo?: string;
  tipo_mineral?: string;
  ubigeo?: string;
  empresas_asignadas: number;
  estado: string;
  id_contrato_concesion?: number;
}

export interface RES_ContratoConcesion {
  id_contrato_concesion: number;
  id_concesion: number;
  id_empresa: number;
  // Campos de empresa
  razon_social: string;
  nombre_comercial?: string;
  ruc: string;
  path_logo?: string;
  // Campos del contrato
  fecha_inicio: string;
  fecha_fin?: string | null;
  estado: string; // "Activo" | "Inactivo"
}
