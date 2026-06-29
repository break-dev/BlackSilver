export interface RES_Contratista {
  id?: number;
  id_contratista: number;
  nombre_completo?: string | null;
  dni: string;
  ruc: string | null;
  fecha_nacimiento: string | null;
  url_foto: string | null;
  id_mina: number | null;
  mina: string | null;
}
