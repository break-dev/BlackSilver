import type { RES_Almacen } from "../../../service/responses/almacen";
import type { RES_UnidadMedida } from "../../../service/responses/unidad-medida";
export type { RES_Almacen, RES_UnidadMedida };

export interface RES_Producto_Local {
  id_producto: number;
  nombre: string;
  unidad_medida_base: string;
  unidad_medida_base_abv: string;
  id_unidad_medida_base: number;
}

export interface RES_DataRegistroSolicitud {
  almacenes: RES_Almacen[];
  productos: RES_Producto_Local[];
  unidades_medida: RES_UnidadMedida[];
}
