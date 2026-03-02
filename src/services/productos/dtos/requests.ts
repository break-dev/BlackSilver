import { z } from "zod";

export const Schema_CrearProducto = z.object({
    id_categoria: z.coerce.number().min(1, "Seleccione una categoría"),
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(128, "Máximo 128 caracteres"),
    es_fiscalizado: z.boolean().default(false),
    es_perecible: z.boolean().default(false),
});

export type DTO_CrearProducto = z.infer<typeof Schema_CrearProducto>;
