import { z } from "zod";

export const Schema_CrearMina = z.object({
    id_concesion: z.number().int().positive({ message: "La concesión es requerida" }),
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    descripcion: z.string().optional(),
});

export type DTO_CrearMina = z.infer<typeof Schema_CrearMina>;

export interface DTO_ListarMinas {
    id_concesion?: number;
}

export interface DTO_AsignarEmpresaMina {
    id_mina: number;
    id_empresa: number;
}
