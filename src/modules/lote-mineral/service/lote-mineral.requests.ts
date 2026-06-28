import type { EstadoLoteMineral } from "../../../shared/enums/lote-mineral";

export interface RegistrarLoteMineralRequest {
  id_contratista: number;
  id_mina: number;
  id_labor: number;
  descripcion?: string | null;
  fecha_inicio_produccion?: string | null;
  estado_inicial: EstadoLoteMineral;
}
