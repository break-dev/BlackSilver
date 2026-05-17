import type { Estado_RequerimientoDetalle } from "../../../shared/enums/requerimiento-almacen/requerimiento";

export interface RES_ControlConsumo {
  id_requerimiento_detalle: number;
  //
  id_requerimiento_almacen: number;
  correlativo_requerimiento: string | number;
  es_auditable: boolean | number;
  //
  id_contratista_solicitante: number;
  contratista_solicitante: string;
  //
  id_mina: number;
  mina: string;
  //
  id_almacen_destino: number;
  almacen_destino: string;
  //
  producto: string;
  //
  id_unidad_medida_base: number;
  unidad_medida_base: string;
  unidad_medida_base_abv: string;
  cantidad_solicitada_base: number;
  cantidad_entregada_base: number;
  //
  id_unidad_medida_req: number;
  unidad_medida_req: string;
  unidad_medida_req_abv: string;
  cantidad_solicitada: number;
  cantidad_entregada: number;
  //
  estado: Estado_RequerimientoDetalle | string;
}
