import type { RES_LoteMineral } from "../../../service/responses/lote-mineral";

export interface RES_LoteMineralProduccion extends RES_LoteMineral {
  consumos: RES_ConsumoProduccion[];
}

export interface RES_ConsumoProduccion {
  id_producto: number;
  producto: string;
  fecha_consumo: string;
  total_consumido: number;
  unidad_base_abv: string;
}
