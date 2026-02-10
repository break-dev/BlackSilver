import { z } from "zod";
import { EstadoBase, TipoRequerimiento } from "../../../../shared/enums";

export const Schema_CrearCategoria = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional().or(z.literal("")),
  tipo_requerimiento: z.enum(
    TipoRequerimiento,
    "Tipo de requerimiento inválido",
  ),
  estado: z.enum(EstadoBase, "Estado inválido"),
});

export type DTO_CrearCategoria = z.infer<typeof Schema_CrearCategoria>;

export const Schema_EditarCategoria = Schema_CrearCategoria.extend({
  id: z.number().min(1, "El ID es obligatorio"),
});

export type DTO_EditarCategoria = z.infer<typeof Schema_EditarCategoria>;

