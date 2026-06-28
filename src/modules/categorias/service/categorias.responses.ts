import type { EstadoBase } from "../../../shared/enums/_generic/estado-base";

export interface RES_CategoriaResumen {
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
  tipo_producto: string;
  clasificacion_bien: string | null;
  para_transporte: boolean;
  control_por_odometro: boolean;
  control_por_horometro: boolean;
  control_por_vueltas: boolean;
  estado: EstadoBase;
  es_consumible: boolean;
  es_auditable: boolean;
  para_cocina: boolean;
  para_mina: boolean;
}
