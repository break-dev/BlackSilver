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
