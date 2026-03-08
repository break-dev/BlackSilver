import { z } from "zod";

export const Schema_CrearEmpresa = z.object({
    ruc: z
        .string()
        .length(11, "El RUC debe tener 11 dígitos")
        .regex(/^\d+$/, "El RUC solo debe contener números"),
    razon_social: z
        .string()
        .min(1, "La Razón Social es requerida")
        .max(128, "La Razón Social no puede exceder 128 caracteres"),
    nombre_comercial: z
        .string()
        .min(1, "El Nombre Comercial es requerido")
        .max(128, "El Nombre Comercial no puede exceder 128 caracteres"),
    abreviatura: z
        .string()
        .min(1, "La Abreviatura es requerida")
        .max(24, "La Abreviatura no puede exceder 24 caracteres"),
    path_logo: z
        .string()
        .min(1, "El Path del Logo es requerido")
        .max(256, "El Path del Logo no puede exceder 256 caracteres"),
});

export type DTO_CrearEmpresa = z.infer<typeof Schema_CrearEmpresa>;
