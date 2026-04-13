import type { EN_KardexOrigenMovimiento } from "../../../shared/enums/kardex";
import type {
  Estado_PrestamoReposicionDetalle_RecepcionDetalle,
  Estado_PrestamoReposicion_Recepcion,
} from "../../../shared/enums/prestamo-almacen/prestamo-reposicion-recepcion";
import type { IArchivo } from "../../../shared/interfaces/menu-navegacion";

export interface RES_PrestamoReposicion_Recepcion {
  id_recepcion: number;
  id_reposicion: number;
  //
  empleado_registro: string;
  //
  fecha_hora_recepcion: string;
  observacion: string | null;
  evidencias: IArchivo[] | null;
  con_incidencia: boolean;
  created_at: string;
  estado: Estado_PrestamoReposicion_Recepcion;
  // Insertado por la api
  detalles?: RES_PrestamoReposicion_RecepcionDetalle[];
}

export interface RES_PrestamoReposicion_RecepcionDetalle {
  id_recepcion_detalle: number;
  id_recepcion: number;
  id_reposicion_detalle: number;
  //
  producto: string;
  producto_destino: string | null;
  //
  id_unidad_medida_base: number;
  unidad_medida_base_abv: string;
  //
  cantidad_recepcionada_base: number;
  // Nuevo Lote o Ajuste de Stock
  tipo_movimiento: EN_KardexOrigenMovimiento;
  //
  id_lote_producto: number | null;
  lote_correlativo: string | null;
  //
  estado: Estado_PrestamoReposicionDetalle_RecepcionDetalle;
}
