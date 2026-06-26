import { z } from "zod";

// Crear mina — datos que el usuario ingresa manualmente
export const Schema_CrearMina = z.object({
  id_concesion: z
    .number()
    .int()
    .positive({ message: "La concesión es requerida" }),
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
});
export type DTO_CrearMina = z.infer<typeof Schema_CrearMina>;

// Asignar empresa ejecutora — solo IDs, el front los arma
export interface DTO_AsignarEmpresaMina {
  id_mina: number;
  id_empresa: number;
}

// Asignar responsable — el usuario elige empleado y fecha
export const Schema_AsignarResponsable = z.object({
  id_mina: z.number().int().positive(),
  id_empleado: z
    .number()
    .int()
    .positive({ message: "El empleado responsable es requerido" }),
  fecha_inicio: z.string().min(1, "La fecha de inicio es requerida"),
});
export type DTO_AsignarResponsable = z.infer<typeof Schema_AsignarResponsable>;

export const Schema_CrearLabor = z.object({
  id_mina: z.number().int().positive({ message: "La mina es obligatoria" }),
  id_empresa: z
    .number()
    .int()
    .positive({ message: "La empresa es obligatoria" }),
  id_tipo_labor: z.number().int().positive().optional().nullable(),
  nombre: z.string().min(1, "El nombre de la labor es obligatorio").max(128),
  prefijo: z
    .string()
    .min(1, "El prefijo es obligatorio")
    .max(32, "El prefijo no puede superar 32 caracteres"),
  descripcion: z.string().optional().nullable(),
  tipo_sostenimiento: z
    .string()
    .min(1, "El tipo de sostenimiento es requerido"),
  veta: z.string().optional().nullable(),
  ancho: z.coerce.number().optional().nullable(),
  alto: z.coerce.number().optional().nullable(),
  nivel: z.string().optional().nullable(),
  fecha_inicio: z.string().optional().nullable(),
  fecha_fin_estimada: z.string().optional().nullable(),
});
export type DTO_CrearLabor = z.infer<typeof Schema_CrearLabor>;

export const Schema_FinalizarLabor = z.object({
  id_labor: z.number().int().positive(),
  fecha_cierre: z.string().min(1, "La fecha de cierre es requerida"),
});
export type DTO_FinalizarLabor = z.infer<typeof Schema_FinalizarLabor>;
