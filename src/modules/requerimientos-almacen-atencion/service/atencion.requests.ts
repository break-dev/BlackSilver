import { Estado_RequerimientoDetalle } from "../../../shared/enums/requerimiento-almacen/requerimiento";

import { z } from "zod";
import { Premura } from "../../../shared/enums/_generic/premura";

export interface DTO_CrearRequerimiento {
  id_empleado_solicitante: number;
  id_mina: number;
  id_labores?: number[] | null;
  id_almacen_destino: number;
  premura: Premura;
  fecha_entrega_requerida?: string | null;
  observacion?: string | null;
  detalles: DTO_CrearRequerimientoDetalle[];
  evidencias?: File[] | null;
}

export interface DTO_CrearRequerimientoDetalle {
  id_producto: number;
  id_unidad_medida: number;
  cantidad_solicitada: number;
  contenido_por_presentacion: number;
  comentario?: string | null;
  id_producto_destino?: number | null;
}

// Zod schemas for validation
export const Schema_CrearRequerimientoDetalle = z.object({
  id_producto: z.number().min(1, "Seleccione un producto"),
  id_unidad_medida: z.number().min(1, "Seleccione una unidad"),
  cantidad_solicitada: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
  contenido_por_presentacion: z
    .number()
    .min(0.0001, "El contenido debe ser mayor a 0"),
  comentario: z.string().nullable().optional(),
  id_producto_destino: z.number().nullable().optional(),
});

export const Schema_CrearRequerimiento = z.object({
  id_empleado_solicitante: z.number().min(1, "Seleccione un solicitante"),
  id_mina: z.number().min(1, "Seleccione una mina"),
  id_labores: z.array(z.number()).nullable().optional(),
  id_almacen_destino: z.number().min(1, "Seleccione un almacén de destino"),
  premura: z.nativeEnum(Premura),
  fecha_entrega_requerida: z.string().nullable().optional(),
  detalles: z
    .array(Schema_CrearRequerimientoDetalle)
    .min(1, "Debe agregar al menos un producto"),
});

export interface DTO_AtencionCambiarEstado {
  id_requerimiento_almacen_detalle?: number;
  ids_detalles?: number[];
  nuevo_estado: Estado_RequerimientoDetalle;
  comentario_decision?: string;
}

export interface DTO_RegistrarEntrega {
  id_requerimiento: number;
  id_empleado_recibe: number;
  fecha_entrega: string;
  observacion?: string;
  evidencias?: File[];
  detalles: DTO_RegistrarEntregaDetalle[];
}

export interface DTO_RegistrarEntregaDetalle {
  id_requerimiento_almacen_detalle: number;
  id_lote_producto: number;
  cantidad_base: number;
  cantidad_lote: number;
  cantidad_requerimiento: number;
}

export interface DTO_CrearSolicitudLogistica {
  id_requerimiento: number;
  observacion?: string;
  premura: string;
  fecha_entrega_requerida: string;
  detalles: {
    id_requerimiento_almacen_detalle: number;
    id_producto: number;
    id_unidad_medida: number;
    cantidad_solicitada: number;
    contenido_por_presentacion: number;
    cantidad_solicitada_base: number;
    comentario?: string;
  }[];
}
