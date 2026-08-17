export interface RES_TipoCarbon {
  id_tipo_carbon: number;
  nombre: string;
  codigo: string | null;
  cantidad_variantes?: number;
}

export interface RES_VarianteCarbon {
  id_tipo_variante: number;
  nombre: string;
  codigo: string | null;
}