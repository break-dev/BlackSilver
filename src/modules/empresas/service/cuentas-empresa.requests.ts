import { z } from "zod";
import { Moneda } from "../../../shared/enums/_generic/moneda";

export const Schema_RegistroCuenta = z.object({
  id_empresa: z.number().int().positive(),
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

export type DTO_RegistroCuenta = z.infer<typeof Schema_RegistroCuenta>;

export const Schema_EditarCuenta = z.object({
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

export type DTO_EditarCuenta = z.infer<typeof Schema_EditarCuenta>;