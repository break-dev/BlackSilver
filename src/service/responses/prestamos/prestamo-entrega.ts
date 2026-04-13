import type { IArchivo } from "../../../shared/interfaces/menu-navegacion";
import type { RES_PrestamoEntrega_Recepcion } from "./prestamo-entrega-recepcion";

export interface RES_PrestamoEntrega {
  id_prestamo_entrega: number;
  id_prestamo_almacen: number;
  id_solicitud_reabastecimiento: number;
  //
  id_almacen_entrega: number;
  almacen_entrega: string;
  //
  empleado_entrega: string;
  empleado_recibe: string;
  //
  correlativo: string;
  fecha_hora_entrega: string;
  observacion: string | null;
  evidencias: IArchivo[] | null;
  created_at: string;
  estado: string;
  // Datos insertados por la api
  detalles: RES_PrestamoEntregaDetalle[];
  recepciones: RES_PrestamoEntrega_Recepcion[];
}

export interface RES_PrestamoEntregaDetalle {
  id_entrega_detalle: number;
  id_prestamo_almacen_entrega: number;
  id_prestamo_almacen_detalle: number;
  id_solicitud_reabastecimiento_detalle: number;
  //
  id_producto: number;
  producto: string;
  //
  id_lote_producto: number;
  lote_correlativo: string;
  // Seguna la unidad base del producto
  id_unidad_medida_base: number;
  unidad_medida_base_abv: string;
  cantidad_base: number;
  cantidad_total_recepcionada_base: number;
  // Segun la unidad de medida del lote usado para la entrega
  id_unidad_medida_lot: number;
  unidad_medida_lot_abv: string;
  contenido_por_presentacion_lot: number;
  cantidad_lot: number;
  // Seguna la unidad de medida del detalle del prestamo
  id_unidad_medida_pr: number;
  unidad_medida_pr_abv: string;
  contenido_por_presentacion_pr: number;
  cantidad_prestamo: number;
  //
  estado: string;
}
