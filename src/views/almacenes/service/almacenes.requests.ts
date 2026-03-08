import { z } from "zod";

export const Schema_CrearAlmacen = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  es_principal: z.boolean().default(false),
});

export type DTO_CrearAlmacen = z.infer<typeof Schema_CrearAlmacen>;

//

export const Schema_NuevoResponsable = z.object({
  id_almacen: z.number().int().positive(),
  id_empleado: z.number().int().positive("Seleccione un empleado"),
  fecha_inicio: z.string().min(1, "La fecha de inicio es requerida"),
});

export type DTO_NuevoResponsable = z.infer<typeof Schema_NuevoResponsable>;