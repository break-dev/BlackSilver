import type { Premura } from "../../../shared/enums/_generic/premura";
import type {
  Estado_Requerimiento,
  Estado_RequerimientoDetalle,
} from "../../../shared/enums/requerimiento-almacen/requerimiento";
import type { IArchivo } from "../../../shared/interfaces/archivo";
import type { RES_Labor } from "../labor";

/**
 * Representa un requerimiento en el resumen de atención
 */
export interface RES_RequerimientoAlmacen {
  id_requerimiento: number;
  //
  id_almacen_destino: number;
  almacen_destino: string;
  //
  id_contratista_solicitante: number;
  solicitante: string;
  responsable: string;
  //
  id_mina: number;
  mina: string;
  //
  correlativo: string;
  evidencias: IArchivo[] | null;
  observacion: string | null;
  es_auditable: boolean;
  premura: Premura;
  fecha_entrega_requerida: string | null;
  estado: Estado_Requerimiento;
  created_at: string;
  // Insertado por la api
  labores?: RES_Labor[];
  detalles?: RES_DetalleRequerimiento[];
}

/**
 * Representa un item de detalle de un requerimiento
 */
export interface RES_DetalleRequerimiento {
  id_requerimiento_almacen_detalle: number;
  id_producto: number;
  id_unidad_medida_base: number;
  unidad_medida_base_abv: string;
  id_unidad_medida_req: number;
  unidad_medida_req_abv: string;
  empleado_atencion: string | null;
  producto: string;
  stock_minimo_base: number;
  stock_disponible_base: number;
  contenido_por_presentacion: number;
  cantidad_solicitada: number;
  cantidad_solicitada_base: number;
  cantidad_entregada: number;
  cantidad_entregada_base: number;
  porcentaje_progreso: number;
  id_producto_destino: number | null;
  producto_destino: string | null;
  comentario: string | null;
  comentario_decision: string | null;
  estado: Estado_RequerimientoDetalle;
}
