import { z } from "zod";
import {
  EstadoBase,
  TipoLabor,
  TipoSostenimiento,
} from "../../../../shared/enums";

export const Schema_CrearLabor = z.object({
  id_concesion: z.number().min(1, "La concesión es obligatoria"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional().or(z.literal("")),
  tipo_labor: z.enum(TipoLabor, "Tipo de labor inválido"),
  tipo_sostenimiento: z.enum(
    TipoSostenimiento,
    "Tipo de sostenimiento inválido",
  ),
  estado: z.enum(EstadoBase, "Estado inválido").optional(),
});

export type DTO_CrearLabor = z.infer<typeof Schema_CrearLabor>;

export const Schema_EditarLabor = Schema_CrearLabor.partial().extend({
  id_labor: z.number().min(1, "El ID de labor es obligatorio"),
});

export type DTO_EditarLabor = z.infer<typeof Schema_EditarLabor>;
