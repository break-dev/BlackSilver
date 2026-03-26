import type { IArchivo } from "../../../shared/interfaces";

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
  id_unidad_medida_sol: number;
  unidad_medida_sol_abv: string;
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
  id_entrega: number;
  correlativo: string;
  fecha_hora_entrega: string;
  observacion: string | null;
  evidencias: IArchivo[] | null;
  estado: string;
  empleado_entrega: string;
  empleado_recibe: string | null;
  detalles: RES_DetalleHistorialEntregaPrestamo[];
}

export interface RES_DetalleHistorialEntregaPrestamo {
  id_entrega_detalle: number;
  id_prestamo_almacen_detalle: number;
  id_producto: number;
  producto: string;
  id_lote_salida: number;
  correlativo_lote: string;
  fecha_vencimiento: string | null;
  id_unidad_medida_sol: number;
  unidad_medida_sol: string;
  unidad_medida_sol_abv: string;
  id_unidad_medida_base: number;
  unidad_medida_base: string;
  unidad_medida_abv: string;
  cantidad: number;
  contenido_por_presentacion: number;
  cantidad_base: number;
  comentario: string | null;
  estado: string;
}
