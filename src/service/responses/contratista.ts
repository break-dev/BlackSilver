export interface RES_Contratista {
  id?: number;
  id_contratista: number;
  nombre: string;
  apellido: string;
  dni: string;
  ruc: string | null;
  fecha_nacimiento: string | null;
  path_foto: string | null;
  id_mina: number | null;
  mina: string | null;
}
