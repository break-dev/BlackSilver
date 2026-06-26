export interface RegistrarLoteMineralRequest {
  id_contratista: number;
  id_mina: number;
  id_labor?: number | null;
  // codigo_interno: generado en Producción, no se envía en el registro inicial
  codigo_interno?: null;
  descripcion?: string | null;
  inicio_produccion?: string | null;
}
