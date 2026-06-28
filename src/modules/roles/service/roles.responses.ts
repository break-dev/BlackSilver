import type { EstadoBase } from "../../../shared/enums/_generic/estado-base";

export interface RES_Rol {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: EstadoBase;
}

export interface RES_Modulo {
  id: number;
  id_submenu: number;
  nombre: string;
  path: string;
  estado: EstadoBase;
}

export interface RES_Submenu {
  id: number;
  id_menu: number;
  nombre: string;
  path: string;
  estado: EstadoBase;
  modulos: RES_Modulo[];
}

export interface RES_MenuEstructura {
  id: number;
  nombre: string;
  path: string;
  estado: EstadoBase;
  submenus: RES_Submenu[];
}
