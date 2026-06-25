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
  url_foto: string | null;
  empresa_pertenece: string;
}