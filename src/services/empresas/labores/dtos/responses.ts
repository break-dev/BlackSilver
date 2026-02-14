export interface RES_Labor {
  id_labor: number;
  id_empresa_concesion: number;

  // New fields from backend JOINs
  id_empresa: number;
  empresa: string;
  id_concesion: number;
  concesion: string;

  nombre: string;
  descripcion: string;
  tipo_labor: string;
  tipo_sostenimiento: string;

  // Optional: relations if returned by backend
  responsable_actual_nombre?: string; // Legacy? Keep for safety
  responsable_actual?: string; // New field from backend
}

export interface RES_UsuarioEmpresa {
  id_usuario_empresa: number;
  nombres: string;
  apellidos: string;
  cargo?: string;
}

export interface RES_HistorialResponsable {
  id_asignacion: number;
  id_usuario_empresa: number;
  nombres: string;
  apellidos: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: string; // "Activo" | "Inactivo"
  observacion?: string;
}
