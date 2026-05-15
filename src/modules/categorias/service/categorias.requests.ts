import { z } from "zod";
import { TipoBien } from "../../../shared/enums/_generic/tipo-bien";
import { TipoProducto } from "../../../shared/enums/_generic/tipo-producto";

export const Schema_RegistroCategoria = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  tipo_producto: z.enum(TipoProducto),
  clasificacion_bien: z.preprocess(
    (val) => (val === "" ? null : val),
    z.enum(TipoBien).nullable().optional(),
  ),
  es_consumible: z.boolean().default(false),
  para_cocina: z.boolean().default(false),
  para_mina: z.boolean().default(false),
  es_auditable: z.boolean().default(false),
  para_transporte: z.boolean().default(false),
  control_por_odometro: z.boolean().default(false),
  control_por_horometro: z.boolean().default(false),
  ids_categorias_consumidoras: z.array(z.number()).default([]),
});

export type DTO_RegistroCategoria = z.infer<typeof Schema_RegistroCategoria>;
