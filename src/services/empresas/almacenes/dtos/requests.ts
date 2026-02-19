import { z } from "zod";

export const Schema_CrearAlmacen = z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    descripcion: z.string().optional(),
    es_principal: z.boolean().default(false),
    // id_empresa ya no se envía
});

export type DTO_CrearAlmacen = z.infer<typeof Schema_CrearAlmacen>;

export const Schema_AsignarResponsableAlmacen = z.object({
    id_almacen: z.number().int().positive(),
    id_usuario: z.number().int().positive({ message: "Debe seleccionar un usuario" }),
    fecha_inicio: z.string().min(1, "La fecha de inicio es requerida"),
    fecha_fin: z.string().nullable().optional()
});

export interface DTO_AsignarResponsableAlmacen {
    id_almacen: number;
    id_usuario: number;
    fecha_inicio: string;
    fecha_fin?: string | null;
}

export interface DTO_AsignarLaborAlmacen {
    id_almacen: number;
    id_labor: number;
}
