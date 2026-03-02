import { z } from "zod";

export const Schema_CrearLote = z.object({
    id_producto: z.coerce.number().min(1, "Seleccione un producto"),
    id_unidad_medida: z.coerce.number().min(1, "Seleccione una unidad"),
    id_almacen: z.coerce.number().min(1, "Seleccione un almacén"),
    descripcion: z.string().optional(),
    stock_inicial: z.coerce.number().min(0, "El stock no puede ser negativo").default(0),
    fecha_ingreso: z.date(),
    fecha_vencimiento: z.date().nullable().optional(),
});

export type DTO_CrearLote = z.infer<typeof Schema_CrearLote>;
