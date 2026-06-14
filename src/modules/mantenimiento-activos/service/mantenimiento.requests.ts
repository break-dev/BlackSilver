import { z } from "zod";

export interface DTO_CrearMantenimiento {
  id_activo_fijo: number;
  id_mina?: number | null;
  id_almacen?: number | null;
  id_empleado_supervisor?: number | null;
  id_proveedor?: number | null;
  id_personal_externo?: number | null;
  id_empleado_ejecutor?: number | null;
  fecha_hora_mantenimiento: string;
  observacion?: string | null;
  lugar_trabajo?: string | null;
  serie_factura?: string | null;
  numero_factura?: string | null;
  costo_mano_obra?: number | null;
  otros_gastos?: Array<{ concepto: string; costo: number }> | null;
  productos_consumidos?: Array<{
    id_entrega_detalle: number;
    cantidad: number;
    comentario?: string | null;
  }> | null;
  evidencias?: File[] | null;
}

export const Schema_CrearMantenimiento = z.object({
  id_activo_fijo: z.number().int().positive(),
  id_mina: z.number().int().positive().nullable().optional(),
  id_almacen: z.number().int().positive().nullable().optional(),
  id_empleado_supervisor: z.number().int().positive().nullable().optional(),
  id_proveedor: z.number().int().positive().nullable().optional(),
  id_personal_externo: z.number().int().positive().nullable().optional(),
  id_empleado_ejecutor: z.number().int().positive().nullable().optional(),
  fecha_hora_mantenimiento: z.string().min(1),
  observacion: z.string().nullable().optional(),
  lugar_trabajo: z.string().nullable().optional(),
  serie_factura: z.string().nullable().optional(),
  numero_factura: z.string().nullable().optional(),
  costo_mano_obra: z.number().nonnegative().nullable().optional(),
  otros_gastos: z
    .array(
      z.object({
        concepto: z.string().min(1),
        costo: z.number().nonnegative(),
      })
    )
    .nullable()
    .optional(),
  productos_consumidos: z
    .array(
      z.object({
        id_entrega_detalle: z.number().int().positive(),
        cantidad: z.number().positive(),
        comentario: z.string().nullable().optional(),
      })
    )
    .nullable()
    .optional(),
});
