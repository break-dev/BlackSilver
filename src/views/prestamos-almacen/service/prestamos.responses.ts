import type { IArchivo } from "../../../shared/interfaces";
import { EstadoReposicion } from "../../../shared/enums/prestamos";

export interface RES_PrestamoResumen {
  id_prestamo: number;
  id_almacen_solicitante: number;
  correlativo: string;
  solicitud_reabastecimiento: string;
  fecha_hora_prestamo: string;
  fecha_limite_devolucion: string;
  almacen_solicitante: string;
  registrado_por: string;
  created_at: string;
  estado: string;
}

export interface RES_PrestamoDetalle {
  id_prestamo_detalle: number;
  id_solicitud_reabastecimiento_detalle: number;
  id_producto: number;
  producto: string;
  contenido_por_presentacion: number;
  cantidad_solicitada: number;
  cantidad_solicitada_base: number;
  cantidad_prestada: number;
  cantidad_prestada_base: number;
  cantidad_repuesta: number;
  cantidad_repuesta_base: number;
  comentario: string | null;
  id_unidad_medida_pr: number;
  unidad_medida_pr_abv: string;
  id_unidad_medida_base: number;
  unidad_medida_base_abv: string;
  estado: string;
}

export interface RES_AlmacenSecundario {
  id: number;
  id_almacen: number;
  nombre: string;
  es_principal: number;
}

export interface RES_Trazabilidad {
  id_log: number;
  estado: string;
  descripcion: string;
  created_at: string;
  empleado: string;
  path_foto: string | null;
}

export interface RES_HistorialEntregaPrestamo {
  id_prestamo_entrega: number;
  correlativo: string;
  fecha_hora_entrega: string;
  observacion: string | null;
  evidencias: IArchivo[] | null;
  estado: string;
  empleado_entrega: string;
  empleado_recibe: string | null;
  detalles: RES_DetalleHistorialEntregaPrestamo[];
  recepciones: RES_HistorialRecepcionPrestamo[];
}

export interface RES_DetalleHistorialEntregaPrestamo {
  id_entrega_detalle: number;
  id_prestamo_almacen_entrega: number;
  id_prestamo_almacen_detalle: number;
  id_producto: number;
  producto: string;
  id_lote_producto: number;
  lote_correlativo: string;
  id_unidad_medida_base: number;
  unidad_medida_base_abv: string;
  cantidad_base: number;
  id_unidad_medida_lot: number;
  unidad_medida_lot_abv: string;
  contenido_por_presentacion_lot: number;
  cantidad_lot: number;
  id_unidad_medida_pr: number;
  unidad_medida_pr_abv: string;
  contenido_por_presentacion_pr: number;
  cantidad_prestamo: number;
  cantidad_recibida_total_base: number;
  estado: string;
}

export interface RES_HistorialReposicion {
  id_reposicion: number;
  correlativo: string;
  fecha_hora_reposicion: string;
  created_at: string;
  estado: EstadoReposicion;
  almacen_entrega: string;
  registrado_por: string;
  observacion: string | null;
  evidencias: IArchivo[] | null;
  detalles: RES_DetalleReposicion[];
}

export interface RES_DetalleReposicion {
  id: number;
  cantidad_base: number;
  cantidad_lote: number;
  cantidad_solicitud: number;
  estado: string;
  producto: string;
  unidad_medida_base: string;
  unidad_medida_base_abv: string;
  lote_correlativo: string;
}

export interface RES_HistorialRecepcionPrestamo {
  id_recepcion: number;
  id_prestamo_almacen_entrega: number;
  id_empleado_registro: number;
  empleado_registro: string;
  observacion: string | null;
  fecha_hora_recepcion: string;
  evidencias: IArchivo[] | null;
  con_incidencia: boolean;
  estado: string;
  detalles: RES_DetalleRecepcionPrestamo[];
}

export interface RES_DetalleRecepcionPrestamo {
  id_recepcion_detalle: number;
  id_prestamo_almacen_entrega_detalle: number;
  id_prestamo_almacen_recepcion: number;
  id_producto: number;
  producto: string;
  id_unidad_medida_base: number;
  unidad_medida_base_abv: string;
  cantidad_recepcionada_base: number;
  contenido_por_presentacion: number;
  id_unidad_medida_sol: number;
  unidad_medida_sol_abv: string;
  cantidad_recepcionada_sol: number;
  estado: string;
}
