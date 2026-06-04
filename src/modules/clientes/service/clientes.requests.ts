import { z } from "zod";

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
