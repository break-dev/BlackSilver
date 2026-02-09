import { z } from "zod";

export const DTO_LoginSchema = z.object({
  usuario: z.string(),
  password: z.string(),
});

export type DTO_Login = z.infer<typeof DTO_LoginSchema>;

// Usuario dentro de la respuesta de login
export interface RES_LoginUsuario {
  id_usuario: number;
  id_rol: number;
  id_empleado: number;
  nombre: string;
  estado: string;
}

// Respuesta del endpoint /api/login
export interface RES_Login {
  token: string;
  usuario: RES_LoginUsuario;
}
