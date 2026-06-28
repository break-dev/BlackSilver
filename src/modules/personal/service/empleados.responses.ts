import type { EstadoBase } from "../../../shared/enums/_generic/estado-base";

export interface RES_EmpleadoResumen {
  id_empleado: number;
  id_empresa: number;
  empresa: string;
  id_cargo: number;
  cargo: string;
  id_area: number;
  area: string;
  nombre: string;
  apellido: string;
  dni: string | null;
  ruc: string | null;
  carnet_extranjeria: string | null;
  pasaporte: string | null;
  fecha_nacimiento: string | null;
  url_foto: string | null;
  estado: EstadoBase;
}

export interface RES_ContratistaResumen {
  id_contratista: number;
  id_mina: number;
  mina: string;
  nombre: string;
  apellido: string;
  dni: string | null;
  ruc: string | null;
  carnet_extranjeria: string | null;
  pasaporte: string | null;
  fecha_nacimiento: string | null;
  url_foto: string | null;
  estado: EstadoBase;
  labores_asignadas: RES_LaborContratista[];
  ids_labor_asignadas?: string | null;
}

export interface RES_LaborContratista {
  id_labor_contratista: number;
  id_labor: number;
  nombre: string;
}
