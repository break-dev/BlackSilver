import type { RES_Lote } from "../../service/lotes.responses";

export interface GroupedProduct {
  id_producto: number;
  producto: string;
  categoria: string | null;
  unidad_medida_base: string;
  stock_minimo: number;
  lotes: RES_Lote[];
  total_stock_base: number;
  vigentes: number;
  por_vencer: number;
  vencidos: number;
  es_perecible: boolean;
}
