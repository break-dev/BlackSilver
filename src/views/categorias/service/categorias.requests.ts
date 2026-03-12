import { z } from "zod";

import { TipoRequerimiento, TipoBien } from "../../../shared/enums/tipos";

export const Schema_RegistroCategoria = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  tipo_requerimiento: z.nativeEnum(TipoRequerimiento, {
    errorMap: () => ({ message: "Seleccione un tipo válido" }),
  } as any),
  clasificacion_bien: z.preprocess(
    (val) => (val === "" ? null : val),
    z.nativeEnum(TipoBien).nullable().optional(),
  ),
});

export type DTO_RegistroCategoria = z.infer<typeof Schema_RegistroCategoria>;
