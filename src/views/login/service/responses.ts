// Usuario dentro de la respuesta de login
export interface RES_LoginUsuario {
  id_usuario: number;
  id_rol: number;
  id_empleado: number;
  nombre: string;
  estado: string;
}

// Respuesta del endpoint
export interface RES_Login {
  token: string;
  usuario: RES_LoginUsuario;
}
export interface ISeccion {
  id_seccion: number;
  nombre: string;
  url: string;
}

export interface ISubmodulo {
  id_submodulo: number;
  nombre: string;
  secciones: ISeccion[];
  path: string;
}

export interface IModulo {
  id_modulo: number;
  nombre: string;
  submodulos: ISubmodulo[];
  path: string;
}
