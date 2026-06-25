import type { RES_Almacen } from "../../../service/responses/almacen";
import type { RES_PrestamoEntrega } from "../../../service/responses/prestamos/prestamo-entrega";
import type { RES_SolicitudDetalle } from "../../../service/responses/solicitudes-reabastecimiento/solicitud";
import type { RES_SolicitudEntrega } from "../../../service/responses/solicitudes-reabastecimiento/solicitud-entrega";

export interface RES_AlmacenVecino extends RES_Almacen {
  es_vecino: boolean;
}

export interface DetalleSolicitudExtendido extends RES_SolicitudDetalle {
  pendiente_base: number;
}

export interface RES_HistorialEntregas {
  logistica: RES_SolicitudEntrega[];
  prestamo: RES_PrestamoEntrega[];
}

export interface RES_StockTotalAlmacen {
  id_producto: number;
  stock_minimo_base: number;
  stock_total_base: number;
}
