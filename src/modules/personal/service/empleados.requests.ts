import { z } from "zod";
import { Genero } from "../../../shared/enums/_generic/genero";

const documentoTransform = (val: string | null | undefined) =>
  val === "" ? null : val;

const fechaTransform = (val: unknown) => {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString().split("T")[0];
  return val as string;
};

// Regex pragmático de email — valida solo si hay valor
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Schema_CrearEmpleado = z
  .object({
    nombre: z.string().min(1, "Los nombres son obligatorios"),
    apellido: z.string().min(1, "Los apellidos son obligatorios"),
    genero: z
      .nativeEnum(Genero, {
        message: "Seleccione un género válido",
      })
      .nullable()
      .optional(),
    dni: z
      .string()
      .optional()
      .nullable()
      .transform(documentoTransform)
      .refine((val) => !val || /^\d{8}$/.test(val), {
        message: "El DNI debe tener exactamente 8 dígitos",
      }),
    ruc: z
      .string()
      .optional()
      .nullable()
      .transform(documentoTransform)
      .refine((val) => !val || /^\d{11}$/.test(val), {
        message: "El RUC debe tener exactamente 11 dígitos",
      }),
    carnet_extranjeria: z
      .string()
      .optional()
      .nullable()
      .transform(documentoTransform),
    pasaporte: z
      .string()
      .optional()
      .nullable()
      .transform(documentoTransform),
    fecha_nacimiento: z.any().optional().nullable().transform(fechaTransform),
    con_contrato: z.boolean().optional().default(false),
    direccion: z
      .string()
      .max(255, "La dirección no debe exceder los 255 caracteres")
      .optional()
      .nullable()
      .transform(documentoTransform),
    telefono: z
      .string()
      .max(32, "El teléfono no debe exceder los 32 caracteres")
      .optional()
      .nullable()
      .transform(documentoTransform),
    email: z
      .string()
      .max(128, "El email no debe exceder los 128 caracteres")
      .optional()
      .nullable()
      .transform(documentoTransform)
      .refine((val) => !val || emailRegex.test(val), {
        message: "Ingrese un email válido",
      }),
    foto: z.any().nullable().optional(),
    id_cargo: z.number().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    // Si NO tiene contrato, id_cargo es obligatorio
    if (!data.con_contrato && (!data.id_cargo || data.id_cargo < 1)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["id_cargo"],
        message: "Debe seleccionar un cargo",
      });
    }
  });

export type DTO_CrearEmpleado = z.infer<typeof Schema_CrearEmpleado>;

export const Schema_CrearContratista = z.object({
  nombre: z.string().min(1, "Los nombres son obligatorios"),
  apellido: z.string().min(1, "Los apellidos son obligatorios"),
  genero: z
    .nativeEnum(Genero, {
      message: "Seleccione un género válido",
    })
    .nullable()
    .optional(),
  dni: z
    .string()
    .optional()
    .nullable()
    .transform(documentoTransform)
    .refine((val) => !val || /^\d{8}$/.test(val), {
      message: "El DNI debe tener exactamente 8 dígitos",
    }),
  ruc: z
    .string()
    .optional()
    .nullable()
    .transform(documentoTransform)
    .refine((val) => !val || /^\d{11}$/.test(val), {
      message: "El RUC debe tener exactamente 11 dígitos",
    }),
  carnet_extranjeria: z
    .string()
    .optional()
    .nullable()
    .transform(documentoTransform),
  pasaporte: z
    .string()
    .optional()
    .nullable()
    .transform(documentoTransform),
  fecha_nacimiento: z.any().optional().nullable().transform(fechaTransform),
  direccion: z
    .string()
    .max(255, "La dirección no debe exceder los 255 caracteres")
    .optional()
    .nullable()
    .transform(documentoTransform),
  telefono: z
    .string()
    .max(32, "El teléfono no debe exceder los 32 caracteres")
    .optional()
    .nullable()
    .transform(documentoTransform),
  email: z
    .string()
    .max(128, "El email no debe exceder los 128 caracteres")
    .optional()
    .nullable()
    .transform(documentoTransform)
    .refine((val) => !val || emailRegex.test(val), {
      message: "Ingrese un email válido",
    }),
  foto: z.any().nullable().optional(),
  id_mina: z.number().min(1, "Debe seleccionar una mina"),
  ids_labor: z.array(z.number()).optional().default([]),
});

export type DTO_CrearContratista = z.infer<typeof Schema_CrearContratista>;

export interface DTO_AsignarLaboresContratista {
  id_mina: number;
  ids_labor: number[];
}
