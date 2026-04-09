export interface RES_Cuenta {
  id_usuario: number;
  username: string;
  estado: string;
  id_rol: number;
  id_empleado: number;
  nombre_rol: string;
  nombre_empleado: string;
  apellido_empleado: string;
  id_mina_pertenece: number;
  path_foto: string | null;
  mina_pertenece: string;
}

export interface RES_EmpleadoDisponible {
  id: number;
  nombre: string;
  apellido: string;
  dni: string | null;
  id_mina_pertenece: number;
}

export interface RES_RolDisponible {
  id: number;
  nombre: string;
}
