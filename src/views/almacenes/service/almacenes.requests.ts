import { z } from "zod";

export const Schema_CrearAlmacen = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  es_principal: z.boolean().default(false),
});

export type DTO_CrearAlmacen = z.infer<typeof Schema_CrearAlmacen>;

//

export interface DTO_NuevoResponsable {
  id_almacen: number;
  id_empleado: number;
  fecha_inicio: string;
}

export interface DTO_AbastecerMina {
  id_almacen: number;
  id_mina: number;
}
