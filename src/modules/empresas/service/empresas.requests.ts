import { z } from "zod";

export const Schema_RegistroEmpresa = z.object({
  ruc: z.string().length(11, "El RUC debe tener 11 dígitos"),
  razon_social: z
    .string()
    .min(3, "La razón social debe tener al menos 3 caracteres"),
  logo: z.string().optional(),
});

export type DTO_RegistroEmpresa = z.infer<typeof Schema_RegistroEmpresa>;
