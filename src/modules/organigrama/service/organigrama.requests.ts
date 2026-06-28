import { z } from "zod";

export const Schema_RegistroArea = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  cargos: z
    .array(z.object({ nombre: z.string().min(2, "Mínimo 2 caracteres") }))
    .optional()
    .default([]),
});

export type DTO_RegistroArea = z.infer<typeof Schema_RegistroArea>;

export const Schema_RegistroCargo = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  id_area: z.number().int().nullable().optional(),
});

export type DTO_RegistroCargo = z.infer<typeof Schema_RegistroCargo>;
