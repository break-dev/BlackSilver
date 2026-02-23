export interface RES_Labor {
  id_labor: number;
  id_empresa: number;
  id_mina: number;
  id_tipo_labor: number;
  mina: string;
  empresa: string;
  tipo_labor_nombre: string;
  is_produccion: number | boolean;
  codigo_correlativo: string;
  nombre: string;
  descripcion: string | null;
  tipo_sostenimiento: string;
  veta: string | null;
  ancho: number | null;
  alto: number | null;
  nivel: string | null;
  fecha_fin: string | null;
  created_at: string;
  estado: string;
}

export interface RES_TipoLabor {
  id_tipo_labor: number;
  codigo: string;
  nombre: string;
  is_produccion: number | boolean;
}
