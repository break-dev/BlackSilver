import type {
  Kardex_OrigenMovimiento,
  Kardex_TipoMovimiento,
} from "../../../shared/enums/kardex";

export interface RES_MovimientoKardex {
  id_kardex: number;
  id_lote_producto: number;
  id_producto: number;
  categoria: string;
  producto: string;
  correlativo: string;
  contenido_por_presentacion: number;
  unidad_lote: string;
  unidad_lote_abv: string;
  unidad_base: string;
  unidad_base_abv: string;
  tipo_movimiento: Kardex_TipoMovimiento;
  tipo_origen: Kardex_OrigenMovimiento;
  descripcion: string | null;
  stock_anterior: number | null; // cuando es por un nuevo lote
  stock_anterior_base: number | null; // cuando es por un nuevo lote
  cantidad_movimiento: number;
  cantidad_movimiento_base: number;
  stock_resultante: number;
  stock_resultante_base: number;
  costo_promedio_base: number;
  created_at: string;
}
