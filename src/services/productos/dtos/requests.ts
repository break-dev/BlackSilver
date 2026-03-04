import { z } from "zod";

export const Schema_CrearProducto = z.object({
    id_categoria: z.coerce.number().min(1, "Seleccione una categoría"),
    id_unidad_medida_base: z.coerce.number().min(1, "Seleccione unidad de medida base"),
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(128, "Máximo 128 caracteres"),
    es_fiscalizado: z.boolean().default(false),
    es_perecible: z.boolean().default(false),
    stock_minimo: z.coerce.number().min(0, "Mínimo 0").default(0),
    tiempo_espera_vencimiento: z.coerce.number().min(0).nullable().default(null),
    periodo_espera_vencimiento: z.string().nullable().default(null),
    dias_espera_vencimiento: z.coerce.number().min(0).nullable().default(null),
});

export type DTO_CrearProducto = z.infer<typeof Schema_CrearProducto>;
