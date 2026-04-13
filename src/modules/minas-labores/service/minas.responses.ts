// Selector de concesiones (paso 1)
export interface RES_ConcesionItem {
  id_concesion: number;
  nombre: string;
}

// Resumen de mina con responsable activo y conteos (tabla principal)
export interface RES_ResumenMina {
  id_mina: number;
  id_concesion: number;
  concesion: string;
  nombre: string;
  descripcion: string | null;
  responsable: string | null;
  dni_responsable: string | null;
  path_foto_responsable: string | null;
  fecha_inicio_responsabilidad: string | null;
  cantidad_labores: number;
  cantidad_empresas_ejecutoras: number;
  almacenes_suministradores: string | null;
  estado: string;
}

// Empresa ejecutora actual de la mina
export interface RES_EmpresaEjecutora {
  id_empresa_mina: number;
  id_empresa: number;
  razon_social: string;
  ruc: string;
  path_logo: string | null;
}

// Empresa disponible para asignar como ejecutora
export interface RES_EmpresaDisponible {
  id_empresa: number;
  razon_social: string;
  path_logo: string | null;
}

// Historial de responsables de la mina
export interface RES_HistorialResponsable {
  id_responsable_mina: number;
  empleado: string;
  dni: string;
  path_foto: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: string;
}

// Empleado disponible para ser asignado como responsable
export interface RES_EmpleadoDisponible {
  id_empleado: number;
  empleado: string;
}

// Labores — información completa de la labor
export interface RES_Labor {
  id_labor: number;
  empresa: string;
  path_logo_empresa: string | null;
  tipo_labor: string;
  es_de_produccion: 0 | 1;
  correlativo: string;
  nombre: string | null;
  descripcion: string | null;
  tipo_sostenimiento: string;
  veta: string | null;
  ancho: number | null;
  alto: number | null;
  nivel: string | null;
  fecha_inicio: string | null;
  fecha_fin_estimada: string | null;
  fecha_cierre: string | null;
  created_at: string;
  estado: string;
}

// Tipo de labor para el selector
export interface RES_TipoLabor {
  id_tipo_labor: number;
  nombre: string;
  es_de_produccion: 0 | 1;
}
