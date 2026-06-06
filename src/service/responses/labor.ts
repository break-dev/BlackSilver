import type { TipoLabor } from "../../shared/enums/labor-minera";

export interface RES_Labor {
  id_labor: number;
  id_mina: number;
  mina: string;
  correlativo: string;
  tipo_labor: TipoLabor;
  nombre: string;
}
