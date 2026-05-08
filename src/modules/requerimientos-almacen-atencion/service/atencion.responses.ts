import type { RES_Almacen } from "../../../service/responses/almacen";
import type { RES_DetalleRequerimiento } from "../../../service/responses/requerimientos-almacen/requerimiento-almacen";
import type { RES_UnidadMedida } from "../../../service/responses/unidad-medida";
export type { RES_Labor } from "../../../service/responses/labor";
export type { RES_Mina } from "../../../service/responses/mina";

// Interfaces Locales para Catálogos (Aislamiento BFF)

export interface RES_Producto {
  id_producto: number;
  id_unidad_medida_base: number;
  nombre: string;
  unidad_medida_base_abv: string;
  unidad_medida_base: string;
  id_categoria: number;
  es_consumible: boolean;
  ids_categorias_consumidoras: string | null; // Viene como "1,2,3" desde PHP GROUP_CONCAT
}

export interface RES_DataRegistro {
  almacenes?: RES_Almacen[];
  productos: RES_Producto[];
  unidades: RES_UnidadMedida[];
}

/**
 * Representa un item de detalle con campos adicionales calculados para la UI
 */
export interface DetalleRequerimientoExtendido extends RES_DetalleRequerimiento {
  pendiente_base: number;
  equivReq: number;
}
