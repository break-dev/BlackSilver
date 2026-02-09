import { z } from "zod";

export const DTO_LoginSchema = z.object({
  usuario: z.string(),
  password: z.string(),
});

export type DTO_Login = z.infer<typeof DTO_LoginSchema>;

export interface RES_Login {
  token: string;
  nombre: string;
  apellido: string;
  dni?: string;
  ruc?: string;
  carnet_extranjeria?: string;
  pasaporte?: string;
  fecha_nacimiento: Date;
  path_foto: string;
}
