// Labor con toda la info de empresa y tipo
export interface RES_Labor {
  id_labor: number;
  empresa: string;
  path_logo_empresa: string | null;
  tipo_labor: string;
  es_de_produccion: 0 | 1;
  correlativo: string;
  nombre: string;
  descripcion: string | null;
  tipo_sostenimiento: string;
  veta: string | null;
  ancho: number | null;
  alto: number | null;
  nivel: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  created_at: string;
  estado: string;
}

// Tipo de labor para el selector
export interface RES_TipoLabor {
  id_tipo_labor: number;
  nombre: string;
  es_de_produccion: 0 | 1;
}

// Empresa ejecutora de la mina, para elegir al crear una labor
export interface RES_EmpresaEjecutoraMina {
  id_empresa: number;
  razon_social: string;
  path_logo: string | null;
}
