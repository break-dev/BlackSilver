import { z } from "zod";

// Schema for creating a Labor
export const Schema_CrearLabor = z.object({
  id_empresa_concesion: z.number().min(1, "Debe seleccionar una empresa valida en la concesion"),
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(128, "El nombre no puede exceder 128 caracteres"),
  descripcion: z.string().optional(),
  tipo_labor: z.string().min(1, "El tipo de labor es requerido"),
  tipo_sostenimiento: z.string().min(1, "El tipo de sostenimiento es requerido"),
});

export type DTO_CrearLabor = z.infer<typeof Schema_CrearLabor>;

// Schema for assigning a Responsable
export const Schema_AsignarResponsable = z.object({
  id_labor: z.number().min(1, "Labor invalida"),
  id_usuario_empresa: z.number().min(1, "Debe seleccionar un responsable"),
  fecha_inicio: z.string().min(1, "La fecha de inicio es requerida"), // ISO Date string YYYY-MM-DD
  observacion: z.string().optional(),
});

export type DTO_AsignarResponsable = z.infer<typeof Schema_AsignarResponsable>;
