import type { DTO_CotizacionRequest, DTO_CotizacionDetalle } from "../../service/cotizaciones.requests";
import { Periodo } from "../../../../shared/enums/_generic/periodo";
import { TipoDespachoCompra } from "../../../../shared/enums/_generic/tipo-despacho-compra";
import { Estado_Cotizacion_Detalle } from "../../../../shared/enums/cotizacion/cotizacion";
import type { RES_Proveedor } from "../../../../service/responses/proveedor";
import type { RES_UnidadMedida } from "../../../../service/responses/unidad-medida";
import type { RES_Producto } from "../../../../service/responses/producto";
import type { RES_Empresa } from "../../service/cotizaciones.responses";
import type { RES_Almacen } from "../../../../service/responses/almacen";

export interface MaestrosState {
  proveedores: RES_Proveedor[];
  unidades: RES_UnidadMedida[];
  catalogo: RES_Producto[];
  empresas: RES_Empresa[];
  almacenes: RES_Almacen[];
}

/** Días equivalentes por período de tiempo de entrega */
export const DIAS_POR_PERIODO: Record<Periodo, number> = {
  [Periodo.Diario]: 1,
  [Periodo.Semanal]: 7,
  [Periodo.Mensual]: 30,
  [Periodo.Anual]: 365,
  [Periodo.Ninguno]: 0,
};

/** Detalle inicial vacío para un nuevo producto en la tabla */
export const detalleVacio = (
  id_producto: number,
  id_unidad_medida: number,
): DTO_CotizacionDetalle => ({
  id_producto,
  id_unidad_medida,
  id_almacen_recepcionista: 0,
  tipo_despacho: TipoDespachoCompra.Envio,
  lugar_recojo: null,
  tiempo_entrega: 1,
  tiempo_entrega_periodo: Periodo.Semanal,
  tiempo_entrega_dias: 7,
  cantidad: 1,
  contenido_por_presentacion: 1,
  cantidad_base: 1,
  precio_unitario: 0,
  precio_unitario_base: 0,
  no_cotiza: false,
  comentario: null,
  estado: Estado_Cotizacion_Detalle.Pendiente,
});

/**
 * Recalcula los totales de una cotización dado el subtotal de los detalles activos.
 */
export function recalcularTotales(
  cot: DTO_CotizacionRequest,
  detalles?: DTO_CotizacionDetalle[],
): Pick<
  DTO_CotizacionRequest,
  "total_antes_igv" | "monto_igv" | "total_despues_igv"
> {
  const items = detalles ?? cot.detalles;
  const subtotal = items.reduce((acc, d) => {
    if (d.no_cotiza) return acc;
    return acc + d.cantidad * d.precio_unitario;
  }, 0);

  const base = subtotal + (cot.costo_flete ?? 0) + (cot.otros_gastos ?? 0);
  const factor = 1 + cot.porcentaje_igv / 100;

  if (cot.incluye_igv) {
    const total_antes = base / factor;
    const monto_igv = base - total_antes;
    return { total_antes_igv: total_antes, monto_igv, total_despues_igv: base };
  } else {
    const monto_igv = base * (cot.porcentaje_igv / 100);
    const total_despues_igv = base + monto_igv;
    return { total_antes_igv: base, monto_igv, total_despues_igv };
  }
}
