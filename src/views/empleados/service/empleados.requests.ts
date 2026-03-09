import { z } from "zod";

export const Schema_CrearEmpleado = z.object({
  id_empresa: z.number("Debe seleccionar una empresa"),
  id_cargo: z.number("Debe seleccionar un cargo"),
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  dni: z.string().max(20).nullable().optional(),
  ruc: z.string().max(20).nullable().optional(),
  carnet_extranjeria: z.string().max(20).nullable().optional(),
  pasaporte: z.string().max(20).nullable().optional(),
  fecha_nacimiento: z.string().nullable().optional(),
  path_foto: z.string().nullable().optional(),
});

export type DTO_CrearEmpleado = z.infer<typeof Schema_CrearEmpleado>;
