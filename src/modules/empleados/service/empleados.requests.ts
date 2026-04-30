import { z } from "zod";

export const Schema_CrearEmpleado = z.object({
  id_mina: z
    .number()
    .nullable()
    .optional()
    .transform((val) => (val === 0 ? null : val)),
  id_cargo: z.number().min(1, "Debe seleccionar un cargo"),
  nombre: z.string().min(1, "Los nombres son obligatorios"),
  apellido: z.string().min(1, "Los apellidos son obligatorios"),
  dni: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .refine((val) => !val || /^\d{8}$/.test(val), {
      message: "El DNI debe tener exactamente 8 dígitos",
    }),
  ruc: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .refine((val) => !val || /^\d{11}$/.test(val), {
      message: "El RUC debe tener exactamente 11 dígitos",
    }),
  carnet_extranjeria: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  pasaporte: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  fecha_nacimiento: z
    .any()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null;
      if (val instanceof Date) return val.toISOString().split("T")[0];
      return val;
    }),
  path_foto: z.any().nullable().optional(),
  ids_labor: z.array(z.number()).optional().default([]),
});

export type DTO_CrearEmpleado = z.infer<typeof Schema_CrearEmpleado>;

export interface DTO_AsignarLabores {
  id_mina: number | null;
  ids_labor: number[];
}
