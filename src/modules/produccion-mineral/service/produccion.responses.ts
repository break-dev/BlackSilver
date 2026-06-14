export interface RES_LoteMineralEnProduccionConsumo {
  id_producto: number;
  producto: string;
  total_consumido: number;
  unidad_base_abv: string;
}

export interface RES_LoteMineralEnProduccion {
  id_lote_mineral: number;
  correlativo: string;
  codigo_interno: string | null;
  descripcion: string | null;
  created_at: string;
  id_contratista: number;
  contratista: string;
  id_mina: number;
  mina: string;
  id_labor: number;
  labor: string;
  consumos: RES_LoteMineralEnProduccionConsumo[];
}
