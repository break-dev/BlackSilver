import { z } from "zod";

// Crear
export const Schema_CrearConcesion = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(64, "Máximo 64 caracteres"),
  codigo_concesion: z.string().min(1, "El código es obligatorio"),
  codigo_reinfo: z.string().min(1, "El código REINFO es obligatorio"),
  ubigeo: z.string().optional(),
  tipo_mineral: z.enum(["Polimetalico", "Carbon"]),
});

export type DTO_CrearConcesion = z.infer<typeof Schema_CrearConcesion>;

// Editar
export const Schema_EditarConcesion = z.object({
  id_concesion: z.number().min(1, "La concesión es obligatoria"),
  nombre: z.string().min(1, "El nombre es obligatorio").max(64, "Máximo 64 caracteres"),
  codigo_concesion: z.string().optional(),
  codigo_reinfo: z.string().optional(),
  ubigeo: z.string().optional(),
  tipo_mineral: z.enum(["Polimetalico", "Carbon"]).optional(),
});

// Asignar
export const Schema_AsignarEmpresa = z.object({
  id_concesion: z.number(),
  id_empresa: z.number(),
  fecha_inicio: z.string().min(1, "Fecha inicio requerida"),
  fecha_fin: z.string().optional().nullable(),
});

export type DTO_AsignarEmpresa = z.infer<typeof Schema_AsignarEmpresa>;

export type DTO_EditarConcesion = z.infer<typeof Schema_EditarConcesion>;
