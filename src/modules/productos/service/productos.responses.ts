import type { EstadoBase } from "../../../shared/enums/_generic/estado-base";

export interface RES_Producto {
  id_producto: number;
  nombre: string;
  //
  id_categoria: number;
  categoria: string;
  //
  id_unidad_medida_base: number;
  unidad_medida_base: string;
  unidad_medida_abreviatura: string;
  //
  es_auditable: boolean;
  es_perecible: boolean;
  //
  stock_minimo_base: number;
  costo_promedio_base: number;
  //
  tiempo_espera_vencimiento: number | null;
  periodo_espera_vencimiento: string | null;
  dias_espera_vencimiento: number | null;
  //
  estado: EstadoBase;
}

export interface RES_CategoriaBien {
  id_categoria: number;
  nombre: string;
  es_auditable: boolean;
}
