import type { EstadoLoteMineral } from '../../../shared/enums/lote-mineral';

export interface LoteMineral {
  id_lote_mineral: number;
  correlativo: string;
  codigo_interno: string | null;
  descripcion: string | null;
  estado: EstadoLoteMineral;
  created_at: string;
  id_contratista: number;
  contratista: string;
  id_mina: number;
  mina: string;
  id_labor: number | null;
  labor: string | null;
  id_empleado_registro: number;
  empleado_registro: string;
}
