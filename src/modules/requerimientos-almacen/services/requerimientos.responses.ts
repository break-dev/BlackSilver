
export interface RES_Producto_Local {
  id_producto: number;
  id_unidad_medida_base: number;
  nombre: string;
  unidad_medida_base_abv: string;
  unidad_medida_base: string;
  id_categoria: number;
  es_consumible: boolean;
  ids_categorias_consumidoras: string | null; // Viene como "1,2,3" desde PHP GROUP_CONCAT
}
