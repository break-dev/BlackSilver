import { z } from "zod";

export const Schema_RegistroRol = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(64, "El nombre es demasiado largo"),
  descripcion: z.string().max(512, "La descripción es demasiado larga").optional(),
  secciones: z.array(z.number()).min(1, "Debe seleccionar al menos una sección"),
});

export type DTO_RegistroRol = z.infer<typeof Schema_RegistroRol>;
