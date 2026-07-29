import { z } from "zod";
import { Moneda } from "../../../shared/enums/_generic/moneda";

export const Schema_CrearCliente = z.object({
  tipo_entidad: z.string().nullable(),
  dni: z
    .string()
    .nullable()
    .refine((val) => !val || /^\d{8}$/.test(val), {
      message: "El DNI debe tener exactamente 8 dígitos",
    }),
  ruc: z
    .string()
    .nullable()
    .refine((val) => !val || /^\d{11}$/.test(val), {
      message: "El RUC debe tener exactamente 11 dígitos",
    }),
  razon_social: z.string().min(2, "La razón social es obligatoria"),
  direccion: z.string().nullable(),
  telefono: z.string().nullable(),
  correo: z
    .string()
    .nullable()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Debe ser un correo electrónico válido",
    }),
});

export type CrearClienteRequest = z.infer<typeof Schema_CrearCliente>;

export const Schema_CrearCuentaBancaria = z.object({
  id_cliente: z.number().min(1, "Seleccione un cliente"),
  id_banco: z.number().min(1, "Seleccione un banco válido"),
  moneda: z.string().min(1, "Seleccione una moneda"),
  numero_cuenta: z.string().min(1, "El número de cuenta es requerido"),
  cci: z.string().optional().nullable(),
  es_para_detraccion: z.number(), // 1 o 0
});
export type CrearCuentaBancariaRequest = z.infer<
  typeof Schema_CrearCuentaBancaria
>;

export const Schema_EditarCuentaBancaria = z.object({
  id_banco: z.number().int().positive(),
  moneda: z.nativeEnum(Moneda),
  numero_cuenta: z
    .string()
    .min(1, "El número de cuenta es obligatorio")
    .max(128, "Máximo 128 caracteres")
    .regex(/^\d+$/, "Solo dígitos"),
  cci: z
    .string()
    .max(128, "Máximo 128 caracteres")
    .regex(/^\d+$/, "Solo dígitos")
    .optional()
    .or(z.literal("")),
  es_para_detraccion: z.boolean().default(false),
});
export type EditarCuentaBancariaRequest = z.infer<
  typeof Schema_EditarCuentaBancaria
>;