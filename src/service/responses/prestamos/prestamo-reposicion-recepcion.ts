import type { Kardex_OrigenMovimiento } from "../../../shared/enums/kardex";
import type {
  Estado_PrestamoReposicionRecepcion,
  Estado_PrestamoReposicionRecepcionDetalle,
} from "../../../shared/enums/prestamo-almacen/prestamo-reposicion-recepcion";
import type { IArchivo } from "../../../shared/interfaces/archivo";

export interface RES_PrestamoReposicionRecepcion {
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
  estado: Estado_PrestamoReposicionRecepcion;
  // Insertado por la api
  detalles?: RES_PrestamoReposicionRecepcionDetalle[];
}

export interface RES_PrestamoReposicionRecepcionDetalle {
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
  tipo_movimiento: Kardex_OrigenMovimiento;
  //
  id_lote_producto: number | null;
  lote_correlativo: string | null;
  //
  estado: Estado_PrestamoReposicionRecepcionDetalle;
}
