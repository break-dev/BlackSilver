import { z } from "zod";

export const Schema_CrearEmpleado = z.object({
    id_cargo: z.coerce.number({ required_error: "Seleccione un cargo" }).min(1, "Seleccione un cargo"),
    id_empresa: z.coerce.number({ required_error: "Seleccione una empresa" }).min(1, "Seleccione una empresa"),
    nombre: z.string().min(1, "Campo obligatorio").max(100),
    apellido: z.string().min(1, "Campo obligatorio").max(100),
    dni: z.string().length(8, "El DNI debe tener 8 dígitos").regex(/^\d+$/, "Solo números").optional().or(z.literal("")),
    ruc: z.string().length(11, "El RUC debe tener 11 dígitos").optional().or(z.literal("")),
    carnet_extranjeria: z.string().max(64).optional().or(z.literal("")),
    pasaporte: z.string().max(64).optional().or(z.literal("")),
    fecha_nacimiento: z.string().optional().or(z.literal("")), // YYYY-MM-DD
    path_foto: z.string().optional().or(z.literal("")),
    telefono: z.string().optional(),
    email: z.string().email("Correo inválido").optional().or(z.literal("")),
    direccion: z.string().optional(),
});

export type DTO_CrearEmpleado = z.infer<typeof Schema_CrearEmpleado>;
