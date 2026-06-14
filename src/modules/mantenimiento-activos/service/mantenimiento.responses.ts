export interface RES_Mantenimiento {
  id_mantenimiento: number;
  id_activo_fijo: number;
  correlativo_activo_fijo: string;
  codigo_activo_fijo: string | null;
  producto_activo_fijo: string;
  fecha_hora_mantenimiento: string;
  observacion: string | null;
  lugar_trabajo: string | null;
  costo_mano_obra: number | string | null;
  otros_gastos: Array<{ concepto: string; costo: number }> | string | null;
  total_horas: number | null;
  total_kilometros: number | null;
  total_vueltas: number | null;
  id_proveedor: number | null;
  proveedor_razon_social: string | null;
  id_empleado_ejecutor: number | null;
  ejecutor_nombre: string | null;
  id_empleado_supervisor: number | null;
  supervisor_nombre: string | null;
  evidencias: string | string[] | null;
}

export interface RES_ProductoDespachadoPendiente {
  id_entrega_detalle: number;
  id_requerimiento_almacen_detalle: number;
  id_producto: number;
  producto: string;
  cantidad_base: number;
  unidad_base_abv: string;
  consumido_base: number;
  restante_base: number;
}
