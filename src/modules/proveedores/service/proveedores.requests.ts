import { TipoEntidad } from "../../../shared/enums/_generic/tipo-entidad";
import { Moneda } from "../../../shared/enums/_generic/moneda";
import { z } from "zod";

/**
 * Esquema de registro de proveedor (logistica).
 * El modulo carbon reutiliza este mismo esquema mas los campos de geografia.
 */
export const Schema_CrearProveedor = z
  .object({
    tipo_entidad: z.enum(TipoEntidad),
    para_mantenimiento: z.boolean(),
    para_transporte: z.boolean(),
    para_carbon: z.boolean().optional().default(false),
    dni: z.string().optional().nullable(),
    ruc: z.string().optional().nullable(),
    razon_social: z.string().min(3, "La razón social o nombre es muy corto"),
    direccion: z.string().optional().nullable(),
    telefono: z.string().optional().nullable(),
    correo: z.email("Correo no válido").optional().or(z.literal("")),
    // Ubicacion geografica (opcional siempre; el front decide si los completa segun el toggle)
    id_departamento: z.number().int().positive().optional().nullable(),
    id_provincia: z.number().int().positive().optional().nullable(),
    id_distrito: z.number().int().positive().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.tipo_entidad === TipoEntidad.Natural) {
      if (!data.dni || !/^\d{8}$/.test(data.dni)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El DNI debe tener exactamente 8 dígitos",
          path: ["dni"],
        });
      }
    } else {
      if (!data.ruc || !/^(10|20)\d{9}$/.test(data.ruc)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El RUC debe tener 11 dígitos y comenzar con 10 o 20",
          path: ["ruc"],
        });
      }
    }
  });

export type CrearProveedorRequest = z.infer<typeof Schema_CrearProveedor>;

export const Schema_CrearBanco = z.object({
  nombre: z.string().min(1, "El nombre del banco es requerido"),
  abreviatura: z.string().min(1, "La abreviatura es requerida"),
});
export type CrearBancoRequest = z.infer<typeof Schema_CrearBanco>;

export const Schema_CrearCuentaBancaria = z.object({
  id_proveedor: z.number().min(1, "Seleccione un proveedor"),
  id_banco: z.number().min(1, "Seleccione un banco válido"),
  moneda: z.string().min(1, "Seleccione una moneda"),
  numero_cuenta: z.string().min(1, "El número de cuenta es requerido"),
  cci: z.string().optional().nullable(),
  es_para_detraccion: z.number(),
});
export type CrearCuentaBancariaRequest = z.infer<
  typeof Schema_CrearCuentaBancaria
>;

export const Schema_EditarCuentaBancaria = z.object({
  id_banco: z.number().min(1, "Seleccione un banco válido"),
  moneda: z.nativeEnum(Moneda),
  numero_cuenta: z.string().min(1, "El número de cuenta es requerido"),
  cci: z.string().optional().nullable(),
  es_para_detraccion: z.boolean(),
});
export type EditarCuentaBancariaRequest = z.infer<
  typeof Schema_EditarCuentaBancaria
>;

/**
 * Representante del proveedor (solo modulo carbon).
 * El backend marca es_representante=1 automaticamente cuando se le pasa
 * un id_proveedor al crear personal_externo desde este flujo.
 */
export const Schema_CrearRepresentante = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().optional().nullable(),
  dni: z
    .string()
    .regex(/^\d{8}$/, "El DNI debe tener 8 dígitos")
    .optional()
    .or(z.literal("")),
});
export type CrearRepresentanteRequest = z.infer<
  typeof Schema_CrearRepresentante
>;

/**
 * Set de tipos de carbon asociados al proveedor (modulo carbon).
 * Reemplaza TODAS las asociaciones existentes.
 */
export const Schema_SetTiposCarbonProveedor = z.object({
  tipos_carbon: z.array(z.number().int().positive()),
});
export type SetTiposCarbonProveedorRequest = z.infer<
  typeof Schema_SetTiposCarbonProveedor
>;