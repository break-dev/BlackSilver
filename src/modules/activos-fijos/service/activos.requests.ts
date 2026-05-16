import type { EstadoActivoFijo, MovimientoActivoFijo } from "../../../shared/enums/activo-fijo";

export interface REQ_CrearActivo {
  id_producto: number;
  id_almacen?: number | null;
  id_mina?: number | null;
  id_marca?: number | null;
  codigo?: string | null;
  numero_serie?: string | null;
  modelo?: string | null;
  yearcito_modelo?: number | null;
  descripcion?: string | null;
  especificaciones?: { clave: string; valor: string }[] | null;
  fecha_hora_ingreso?: string | null;
  estado?: EstadoActivoFijo;
}

export interface REQ_ActualizarUbicacion {
  id_activo: number;
  tipo_movimiento: MovimientoActivoFijo;
  id_almacen?: number | null;
  id_mina?: number | null;
  descripcion?: string | null;
  fecha_hora_movimiento?: string | null;
}
