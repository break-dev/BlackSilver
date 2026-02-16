import { z } from "zod";

// 1. Crear Almacén
export const Schema_CrearAlmacen = z.object({
    id_empresa: z.number().min(1, "Seleccione una empresa"),
    nombre: z.string().min(1, "El nombre es obligatorio").max(128),
    descripcion: z.string().optional(),
    es_principal: z.boolean().optional().default(false),
});

export type DTO_CrearAlmacen = z.infer<typeof Schema_CrearAlmacen>;

// 2. Asignar Responsable
export const Schema_AsignarResponsableAlmacen = z.object({
    id_almacen: z.number().min(1),
    id_usuario_empresa: z.number().min(1, "Seleccione un usuario"),
    fecha_inicio: z.string().min(1, "Fecha de inicio requerida"), // YYYY-MM-DD
});

export type DTO_AsignarResponsableAlmacen = z.infer<typeof Schema_AsignarResponsableAlmacen>;

// 3. Asignar Labor (Alcance Operativo)
export const Schema_AsignarLaborAlmacen = z.object({
    id_almacen: z.number().min(1),
    id_labor: z.number().min(1, "Seleccione una labor"),
});

export type DTO_AsignarLaborAlmacen = z.infer<typeof Schema_AsignarLaborAlmacen>;
