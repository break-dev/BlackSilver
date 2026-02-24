import { z } from "zod";

export const Schema_CrearLabor = z.object({
  id_mina: z.number().int().positive({ message: "La mina es obligatoria" }),
  id_empresa: z.number().int().positive({ message: "La empresa es obligatoria" }),
  id_tipo_labor: z.number().int().positive({ message: "El tipo de labor es obligatorio" }),

  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  tipo_sostenimiento: z.string().min(1, "El tipo de sostenimiento es requerido"),

  veta: z.string().optional().nullable(),
  ancho: z.coerce.number().optional().nullable(),
  alto: z.coerce.number().optional().nullable(),
  nivel: z.string().optional().nullable(),

  fecha_inicio: z.string().optional().nullable(),
  fecha_fin: z.string().optional().nullable(),
});

export type DTO_CrearLabor = z.infer<typeof Schema_CrearLabor>;

export interface DTO_AsignarResponsableLabor {
  id_labor: number;
  id_usuario: number;
  fecha_inicio: string;
}
