import { z } from "zod";

export const Schema_RegistroOficina = z.object({
  id_empresa: z.number().int().positive(),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(128, "El nombre no puede superar los 128 caracteres"),
  direccion: z
    .string()
    .max(256, "La dirección no puede superar los 256 caracteres")
    .optional()
    .or(z.literal("")),
  es_principal: z.boolean().optional().default(false),
});

export type DTO_RegistroOficina = z.infer<typeof Schema_RegistroOficina>;
