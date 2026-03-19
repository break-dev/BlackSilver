export interface RES_Cuenta {
  id_usuario: number;
  username: string;
  estado: string;
  id_rol: number;
  id_empleado: number;
  nombre_rol: string;
  nombre_empleado: string;
  apellido_empleado: string;
  id_empresa_pertenece: number;
  path_foto: string | null;
  empresa_pertenece: string;
}

export interface RES_EmpleadoDisponible {
  id: number;
  nombre: string;
  apellido: string;
  dni: string | null;
  id_empresa_pertenece: number;
}

export interface RES_RolDisponible {
  id: number;
  nombre: string;
}

export interface REQ_CrearCuenta {
  id_rol: number;
  id_empleado: number;
  username: string;
  password: string;
}

export interface REQ_ActualizarCuenta {
  id_rol: number;
  username: string;
  password?: string;
  estado?: string;
}
