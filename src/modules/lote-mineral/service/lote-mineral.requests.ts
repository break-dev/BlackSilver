export interface RegistrarLoteMineralRequest {
  id_contratista: number;
  id_mina: number;
  id_labor?: number | null;
  codigo_interno?: string | null;
  descripcion?: string | null;
}
