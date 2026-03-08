import { z } from "zod";

export const Schema_RegistroCategoria = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  tipo_requerimiento: z
    .string()
    .min(1, "El tipo de requerimiento es obligatorio"),
  clasificacion_bien: z.string().optional(),
});

export type DTO_RegistroCategoria = z.infer<typeof Schema_RegistroCategoria>;
