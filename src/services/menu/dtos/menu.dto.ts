export interface ISeccion {
  nombre: string;
  url: string;
}

export interface ISubmodulo {
  nombre: string;
  secciones: ISeccion[];
}

export interface IModulo {
  nombre: string;
  submodulo: ISubmodulo[];
}

export interface IMenuStore {
  menu: IModulo[];
  updateMenu: (menu: IModulo[]) => void;
}
