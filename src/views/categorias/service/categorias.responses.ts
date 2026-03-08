export interface RES_Categoria {
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
  tipo_requerimiento: string;
  clasificacion_bien: string | null;
  estado: string;
}
