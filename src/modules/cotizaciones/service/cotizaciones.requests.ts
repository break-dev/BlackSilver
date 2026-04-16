import { z } from "zod";
import { Estado_Cotizacion, Estado_Cotizacion_Detalle } from "../../../shared/enums/cotizacion/cotizacion";
import { MetodoPago } from "../../../shared/enums/_generic/metodo-pago";

// Detalle de cada producto dentro de una cotización específica
export const Schema_CotizacionDetalle = z.object({
  id_producto: z.number().min(1, "Producto no válido"),
  id_unidad_medida: z.number().min(1, "Seleccione una unidad de medida"),
  cantidad: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
  contenido_por_presentacion: z.number().min(0.01, "Mínimo 1"),
  cantidad_base: z.number(), // Calculado: cantidad * contenido
  precio_unitario: z.number().min(0, "Precio no válido"),
  precio_unitario_base: z.number(), // Calculado: precio_unitario / contenido
  comentario: z.string().optional().nullable(),
  no_cotiza: z.boolean().optional().default(false),
  estado: z.nullable(z.enum([Estado_Cotizacion_Detalle.Aprobado, Estado_Cotizacion_Detalle.Rechazado])).optional(),
});

// Cabecera de una cotización (un proveedor)
export const Schema_CotizacionRequest = z.object({
  id_proveedor: z.number().min(1, "Seleccione un proveedor"),
  moneda: z.string().min(1, "Seleccione una moneda"),
  metodo_pago: z.nativeEnum(MetodoPago),
  fecha_vencimiento_pago: z.string().optional().nullable(),
  total_antes_igv: z.number(),
  incluye_igv: z.boolean().default(true),
  porcentaje_igv: z.number().default(18),
  monto_igv: z.number(),
  total_despues_igv: z.number(),
  observacion: z.string().optional().nullable(),
  empresas_ids: z.array(z.number()).min(1, "Seleccione al menos una empresa"),
  estado: z.enum(Estado_Cotizacion).default(Estado_Cotizacion.Generada),
  detalles: z
    .array(Schema_CotizacionDetalle)
    .min(1, "Agregue al menos un producto a la cotización"),
});

// Producto base que se va a comparar (pueden ser varios)
export const Schema_ProductoComparativo = z.object({
  id_producto: z.number().min(1),
  id_solicitud_detalle: z.number().optional().nullable(),
});

// Objeto raíz para el registro masivo
export const Schema_RegistrarComparativo = z.object({
  productos: z
    .array(Schema_ProductoComparativo)
    .min(1, "Debe agregar productos al comparativo"),
  cotizaciones: z
    .array(Schema_CotizacionRequest)
    .min(1, "Debe agregar al menos una cotización"),
});

export type DTO_CotizacionDetalle = z.infer<typeof Schema_CotizacionDetalle>;
export type DTO_CotizacionRequest = z.infer<typeof Schema_CotizacionRequest>;
export type DTO_ProductoComparativo = z.infer<
  typeof Schema_ProductoComparativo
>;
export type DTO_RegistrarComparativo = z.infer<
  typeof Schema_RegistrarComparativo
>;
