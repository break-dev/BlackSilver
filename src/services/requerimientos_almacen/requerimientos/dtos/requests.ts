import { z } from "zod";
import { Premura } from "../../../../shared/enums";

export interface DTO_CrearRequerimiento {
    id_mina: number;
    id_labor?: number | null;
    id_almacen_destino: number;
    premura: Premura;
    fecha_entrega_requerida: string;
    detalles: DTO_CrearRequerimientoDetalle[];
}

export interface DTO_CrearRequerimientoDetalle {
    id_producto: number;
    id_unidad_medida: number;
    cantidad_solicitada: number;
    comentario?: string | null;
}

// Zod schemas for validation
export const Schema_CrearRequerimientoDetalle = z.object({
    id_producto: z.number().min(1, "Seleccione un producto"),
    id_unidad_medida: z.number().min(1, "Seleccione una unidad"),
    cantidad_solicitada: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
    comentario: z.string().nullable().optional(),
});

export const Schema_CrearRequerimiento = z.object({
    id_mina: z.number().min(1, "Seleccione una mina"),
    id_labor: z.number().nullable().optional(),
    id_almacen_destino: z.number().min(1, "Seleccione un almacén de destino"),
    premura: z.nativeEnum(Premura),
    fecha_entrega_requerida: z.string().min(1, "Seleccione una fecha de entrega"),
    detalles: z.array(Schema_CrearRequerimientoDetalle).min(1, "Debe agregar al menos un producto"),
});
