export interface RES_Labor {
  id_labor: number;
  id_empresa: number;
  empresa: string;
  id_mina: number;
  mina: string;
  id_tipo_labor: number;
  tipo_labor_nombre: string;

  codigo_correlativo: string;
  nombre: string;
  descripcion?: string;
  tipo_sostenimiento: string;
  estado: string;

  // Campos opcionales / calculados
  is_produccion?: number | boolean;
  responsable_actual?: string;
}

export interface RES_TipoLabor {
  id_tipo_labor: number;
  codigo: string;
  nombre: string;
  is_produccion: number | boolean;
}

// Historial Responsable Labor (Tabla responsable_labor)
export interface RES_HistorialResponsableLabor {
  id_asignacion: number;
  id_labor: number;
  id_usuario: number;
  usuario_nombre: string; // Nombre completo del usuario
  nombres?: string;
  apellidos?: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: string;
}
