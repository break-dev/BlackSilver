import type { EstadoBase, TipoRequerimiento } from "../../../../shared/enums";

export interface RES_Categoria {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
  tipo_requerimiento: TipoRequerimiento;
  clasificacion_bien?: string;
  estado: EstadoBase;
}
