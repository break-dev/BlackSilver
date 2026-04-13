import { z } from "zod";
import { TipoBien } from "../../../shared/enums/_generic/tipo-bien";

export const Schema_RegistroCategoria = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  tipo_requerimiento: z.nativeEnum(TipoBien, {
    errorMap: () => ({ message: "Seleccione un tipo válido" }),
  } as any),
  clasificacion_bien: z.preprocess(
    (val) => (val === "" ? null : val),
    z.enum(TipoBien).nullable().optional(),
  ),
  es_consumible: z.boolean().default(false),
  para_cocina: z.boolean().default(false),
  para_mina: z.boolean().default(false),
  ids_categorias_consumidoras: z.array(z.number()).default([]),
});

export type DTO_RegistroCategoria = z.infer<typeof Schema_RegistroCategoria>;
