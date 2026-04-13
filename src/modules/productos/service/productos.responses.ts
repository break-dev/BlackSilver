import type { EstadoBase } from "../../../shared/enums/_generic/estado-base";

export interface RES_Producto {
  id_producto: number;
  categoria: string;
  unidad_medida_base: string;
  unidad_medida_abreviatura: string;
  nombre: string;
  es_fiscalizado: boolean;
  es_perecible: boolean;
  stock_minimo: number;
  tiempo_espera_vencimiento: number | null;
  periodo_espera_vencimiento: string | null;
  dias_espera_vencimiento: number | null;
  estado: EstadoBase;
}

export interface RES_UnidadMedida {
  id_unidad_medida: number;
  nombre: string;
  abreviatura: string;
}

export interface RES_CategoriaBien {
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
  clasificacion_bien: string | null;
}
