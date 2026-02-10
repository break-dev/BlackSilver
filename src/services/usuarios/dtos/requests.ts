import { z } from "zod";

export const Schema_Login = z.object({
  usuario: z.string().min(1, "El usuario es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type DTO_Login = z.infer<typeof Schema_Login>;
