import { TipoEntidad } from "../../../shared/enums/tipos";
import { z } from "zod";

export const Schema_CrearProveedor = z.object({
  tipo_entidad: z.enum(TipoEntidad),
  dni: z.string().optional().nullable(),
  ruc: z.string().optional().nullable(),
  razon_social: z.string().min(3, "La razón social o nombre es muy corto"),
  direccion: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  correo: z.string().email("Correo no válido").optional().or(z.literal("")),
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
  es_para_detraccion: z.number(), // 1 o 0
});
export type CrearCuentaBancariaRequest = z.infer<
  typeof Schema_CrearCuentaBancaria
>;
