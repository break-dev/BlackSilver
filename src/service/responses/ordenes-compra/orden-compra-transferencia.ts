import type {
  Estado_OCTransferencia,
  Estado_OCTransferenciaDetalle,
} from "../../../shared/enums/orden-compra/orden-compra-transferencia";
import type { IArchivo } from "../../../shared/interfaces/archivo";

export interface RES_OCTransferencia {
  id_transferencia: number;
  id_orden_compra_recepcion: number;
  //
  correlativo: string;
  //
  id_almacen_destino: number;
  almacen_destino: string;
  es_para_un_almacen_principal: boolean;
  //
  empleado_transferencia: string;
  personal_recibe: string;
  //
  fecha_hora_transferencia: string;
  observacion: string | null;
  evidencias: IArchivo[] | null;
  //
  created_at: string;
  estado: Estado_OCTransferencia;
  //
  detalles?: RES_OCTransferenciaDetalle[];
}

export interface RES_OCTransferenciaDetalle {
  id_transferencia_detalle: number;
  id_orden_compra_transferencia: number;
  id_orden_compra_recepcion_detalle: number;
  //
  id_producto: number;
  producto: string;
  //
  id_lote_producto: number;
  lote_correlativo: string;
  //
  id_unidad_medida_base: number;
  unidad_medida_base_abv: string;
  cantidad_transferida_base: number;
  //
  id_unidad_medida_lot: number;
  unidad_medida_lot_abv: string;
  contenido_por_presentacion_lot: number;
  cantidad_transferida_lot: number;
  //
  id_unidad_medida_oc: number;
  unidad_medida_oc_abv: string;
  contenido_por_presentacion_oc: number;
  cantidad_transferida_oc: number;
  //
  comentario: string | null;
  estado: Estado_OCTransferenciaDetalle;
}
