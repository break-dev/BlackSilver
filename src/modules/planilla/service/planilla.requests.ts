import { z } from "zod";

/**
 * Filtros para el listado de Planilla.
 */
export const Schema_FiltrosPlanilla = z.object({
  mes: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" || v === null || v === undefined ? null : Number(v))),
  year: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" || v === null || v === undefined ? null : Number(v))),
  id_empleado: z
    .union([z.string(), z.number()])
    .nullable()
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? null : Number(v))),
  id_almacen: z.number().int().min(1).nullable().optional(),
  id_labor: z.number().int().min(1).nullable().optional(),
  id_lugar: z.number().int().min(1).nullable().optional(),
  tipo_lugar: z.enum(["almacen", "labor"]).nullable().optional(),
  q: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? null : v)),
});

export type DTO_FiltrosPlanilla = z.infer<typeof Schema_FiltrosPlanilla>;
