export interface RES_Labor {
  id: number;
  id_empresa_concesion: number;
  nombre: string;
  descripcion: string;
  tipo_labor: string;
  tipo_sostenimiento: string;
  // Optional: relations if returned by backend
  empresa_nombre?: string;
  concesion_nombre?: string;
  responsable_actual_nombre?: string;
}

export interface RES_ResponsableLabor {
  id: number;
  id_labor: number;
  id_usuario_empresa: number;
  nombre_responsable: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: string;
  observacion?: string;
}
