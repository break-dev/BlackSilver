export interface RES_LoteMineral {
  id_lote_mineral: number;
  //
  id_mina: number;
  mina: string;
  //
  id_labor: number;
  labor: string | null;
  labor_prefijo: string | null;
  //
  correlativo: string;
  codigo_interno: string | null;
  fecha_inicio_produccion: string | null;
}
