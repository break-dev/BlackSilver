import { z } from "zod";

export const Schema_CrearLote = z.object({
  id_producto: z.coerce.number().min(1, "Seleccione un producto"),
  id_unidad_medida: z.coerce.number().min(1, "Seleccione una unidad"),
  id_almacen: z.coerce.number().min(1, "Seleccione un almacén"),
  descripcion: z.string().optional().nullable(),
  stock_inicial: z.coerce
    .number()
    .min(0, "El stock no puede ser negativo")
    .default(0),
  contenido_por_presentacion: z.coerce
    .number()
    .min(0.0001, "El contenido debe ser mayor a 0")
    .default(1),
  fecha_hora_ingreso: z.any().transform((val) => {
    if (!val) return null;
    return new Date(val);
  }),
  fecha_vencimiento: z
    .any()
    .transform((val) => {
      if (!val) return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    })
    .nullable()
    .optional(),
  serie_factura_compra: z.string().optional().nullable(),
  numero_factura_compra: z.string().optional().nullable(),
  costo_por_unidad: z.coerce.number().optional().nullable(),
});

export type DTO_CrearLote = z.infer<typeof Schema_CrearLote>;

export const Schema_AjustarStock = z.object({
  id_lote: z.number().min(1, "Lote requerido"),
  nuevo_stock: z.number().min(0, "El stock no puede ser negativo"),
  nuevo_stock_base: z.number().min(0, "El stock base no puede ser negativo"),
  motivo: z
    .string()
    .min(5, "El motivo es obligatorio y debe tener al menos 5 caracteres"),
});

export type DTO_AjustarStock = z.infer<typeof Schema_AjustarStock>;
