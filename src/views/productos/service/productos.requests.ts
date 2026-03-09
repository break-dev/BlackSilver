import { z } from "zod";

export const Schema_CrearProducto = z.object({
  id_categoria: z.number().min(1, "Debe seleccionar una categoría"),
  id_unidad_medida_base: z
    .number()
    .min(1, "Debe seleccionar una unidad de medida"),
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(128, "Máximo 128 caracteres"),
  es_fiscalizado: z.boolean(),
  es_perecible: z.boolean(),
  stock_minimo: z.number().min(0, "Mínimo 0"),
  tiempo_espera_vencimiento: z.number().nullable().optional(),
  periodo_espera_vencimiento: z.string().nullable().optional(),
});

export type DTO_CrearProducto = z.infer<typeof Schema_CrearProducto>;
