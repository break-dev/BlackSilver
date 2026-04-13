import type { RES_UnidadMedida } from "../../../service/responses/unidad-medida";
import type { RES_Almacen } from "../../../service/responses/almacen";
import type { RES_SolicitudEntrega } from "../../../service/responses/solicitudes-reabastecimiento/solicitud-entrega";
import type { RES_PrestamoEntrega } from "../../../service/responses/prestamos/prestamo-entrega";

export interface RES_Producto {
  id_producto: number;
  nombre: string;
  id_unidad_medida_base: number;
  unidad_medida_base: string;
  unidad_medida_base_abv: string;
}

export interface RES_HistorialEntregas {
  logistica: RES_SolicitudEntrega[];
  prestamo: RES_PrestamoEntrega[];
}
export interface RES_DataRegistroSolicitud {
  almacenes: RES_Almacen[];
  productos: RES_Producto[];
  unidades_medida: RES_UnidadMedida[];
}
