export interface RES_Rol {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: string;
}

export interface RES_Seccion {
  id: number;
  id_submodulo: number;
  nombre: string;
  path: string;
  estado: string;
}

export interface RES_Submodulo {
  id: number;
  id_modulo: number;
  nombre: string;
  path: string;
  estado: string;
  secciones: RES_Seccion[];
}

export interface RES_ModuloEstructura {
  id: number;
  nombre: string;
  path: string;
  estado: string;
  submodulos: RES_Submodulo[];
}
