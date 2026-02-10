import { z } from "zod";

// Crear
export const Schema_CrearConcesion = z.object({
  id_empresa: z.number().min(1, "La empresa es obligatoria"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
});

export type DTO_CrearConcesion = z.infer<typeof Schema_CrearConcesion>;

// Editar
export const Schema_EditarConcesion = z.object({
  id_concesion: z.number().min(1, "La concesión es obligatoria"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
});

export type DTO_EditarConcesion = z.infer<typeof Schema_EditarConcesion>;
