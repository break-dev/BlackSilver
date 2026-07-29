import type { EstadoBase } from "../../../shared/enums/_generic/estado-base";
import type { TipoSostenimiento } from "../../../shared/enums/labor-minera";

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
  responsables: string | null;
  cantidad_labores: number;
  cantidad_empresas_ejecutoras: number;
  almacenes_suministradores: string | null;
  estado: EstadoBase;
}

// Empresa ejecutora actual de la mina
export interface RES_EmpresaEjecutora {
  id_empresa_mina: number;
  id_empresa: number;
  razon_social: string;
  ruc: string;
  url_logo: string | null;
}

// Historial de responsables de la mina
export interface RES_HistorialResponsable {
  id_responsable_mina: number;
  id_empleado: number;
  nombre_completo: string;
  dni: string;
  url_foto: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: EstadoBase;
}

// Empleado disponible para ser asignado como responsable
export interface RES_EmpleadoDisponible {
  id_empleado: number;
  nombre_completo: string;
}

// Labores — información completa de la labor
export interface RES_ResumenLabor {
  id_labor: number;
  empresa: string;
  url_logo_empresa: string | null;
  tipo_labor: string;
  es_de_produccion: boolean;
  nombre: string;
  prefijo: string;
  descripcion: string | null;
  tipo_sostenimiento: TipoSostenimiento;
  veta: string | null;
  ancho: number | null;
  alto: number | null;
  nivel: string | null;
  fecha_inicio: string | null;
  fecha_fin_estimada: string | null;
  fecha_cierre: string | null;
  created_at: string;
  estado: EstadoBase;
}

// Tipo de labor para el selector
export interface RES_TipoLabor {
  id_tipo_labor: number;
  nombre: string;
  es_de_produccion: boolean;
}
