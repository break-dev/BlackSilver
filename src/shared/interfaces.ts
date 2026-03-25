export interface IRespuesta<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface IMessage {
  type: "success" | "info" | "error" | "";
  content: string;
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

export interface IArchivo {
  url: string;
  path_relativo: string;
  nombre_original: string | null;
  extension: string | null;
}
