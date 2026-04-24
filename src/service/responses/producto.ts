export interface RES_Producto {
  id_producto: number;
  nombre: string;
  es_perecible: boolean;
  es_fiscalizado: boolean;
  //
  id_categoria: number;
  categoria: string;
  //
  id_unidad_medida_base: number;
  unidad_medida_base: string;
  unidad_medida_base_abv: string;
}
