import { z } from "zod";

export const Schema_CrearTipoCarbon = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(128),
  codigo: z.string().max(32).optional().nullable(),
});
export type CrearTipoCarbonRequest = z.infer<typeof Schema_CrearTipoCarbon>;

export const Schema_ActualizarTipoCarbon = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(128),
  codigo: z.string().max(32).optional().nullable(),
});
export type ActualizarTipoCarbonRequest = z.infer<
  typeof Schema_ActualizarTipoCarbon
>;

export const Schema_SetVariantes = z.object({
  variantes: z.array(z.number().int().positive()).default([]),
});
export type SetVariantesRequest = z.infer<typeof Schema_SetVariantes>;