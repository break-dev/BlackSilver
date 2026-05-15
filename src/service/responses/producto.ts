export interface RES_Producto {
  id_producto: number;
  nombre: string;
  //
  id_categoria: number;
  categoria: string;
  es_consumible: boolean;
  ids_categorias_consumidoras: string | null; // Viene como "1,2,3" desde PHP GROUP_CONCAT
  //
  stock_minimo_base: number;
  //
  id_unidad_medida_base: number;
  unidad_medida_base: string;
  unidad_medida_base_abv: string;
  //
  es_perecible: boolean;
  es_auditable: boolean;
  //
  prefijo: string | null;
  costo_promedio_base: number;
  costo_promedio_base_log: string | null; // Viene como JSON string desde DB en este query crudo
  //
  dias_espera_vencimiento: number | null;
}
