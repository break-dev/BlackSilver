export interface RES_Categoria {
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
  tipo_producto: string;
  clasificacion_bien: string | null;
  estado: string;
  es_consumible: boolean;
  para_cocina: boolean;
  para_mina: boolean;
  nombres_consumidoras: string | null;
  ids_categorias_consumidoras: string | null;
}
