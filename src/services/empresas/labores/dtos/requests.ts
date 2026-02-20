import { z } from "zod";

export const Schema_CrearLabor = z.object({
  id_mina: z.number().int().positive({ message: "La mina es obligatoria" }),
  id_empresa: z.number().int().positive({ message: "La empresa es obligatoria" }),
  id_tipo_labor: z.number().int().positive({ message: "El tipo de labor es obligatorio" }),

  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),

  // Sostenimiento puede ser enum o string libre, por ahora string libre según requerimiento
  tipo_sostenimiento: z.string().min(1, "El tipo de sostenimiento es requerido"),
});

export type DTO_CrearLabor = z.infer<typeof Schema_CrearLabor>;

export const Schema_AsignarResponsable = z.object({
  id_labor: z.number().int().positive(),
  id_usuario: z.number().int().positive({ message: "Debe seleccionar un usuario responsable" }),
  fecha_inicio: z.string().min(1, "La fecha de inicio es requerida"), // YYYY-MM-DD
  observacion: z.string().optional(),
});

export type DTO_AsignarResponsable = z.infer<typeof Schema_AsignarResponsable>;
