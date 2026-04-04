import {
  EstadoRequerimiento,
  EstadoDetalleRequerimiento,
} from "../../../shared/enums/estados";
import { Premura } from "../../../shared/enums/otros";

export interface RES_LaborRelacionada {
  id_labor: number;
  nombre: string;
  correlativo: string;
}

export interface RES_RequerimientoAlmacen {
  id_requerimiento: number;
  id_mina: number;
  id_almacen_destino: number;
  correlativo: string;
  mina: string;
  almacen_destino: string;
  premura: Premura;
  fecha_entrega_requerida: string;
  estado: EstadoRequerimiento;
  labores: RES_LaborRelacionada[];
  created_at: string;
  observacion?: string;
}

export interface RES_RequerimientoDetalle {
  id_requerimiento_almacen_detalle: number;
  producto: string;
  unidad_medida_base: string;
  unidad_medida: string;
  contenido_por_presentacion: number;
  cantidad_solicitada: number;
  cantidad_solicitada_base: number;
  cantidad_entregada: number;
  cantidad_entregada_base: number;
  porcentaje_progreso: number;
  estado: EstadoDetalleRequerimiento;
  comentario?: string;
  comentario_decision?: string;
  empleado_atencion?: string;
  id_producto_destino?: number | null;
  producto_destino?: string | null;
}

export interface RES_TrazabilidadEvento {
  id_trazabilidad: number;
  empleado: string;
  tipo_origen: string;
  descripcion: string;
  created_at: string;
  estado: string;
}

// Interfaces Locales para Catálogos (Aislamiento BFF)
export interface RES_Mina_Local {
  id_mina: number;
  nombre: string;
}

export interface RES_Almacen_Local {
  id_almacen: number;
  nombre: string;
}

export interface RES_Labor_Local {
  id_labor: number;
  nombre: string;
  correlativo: string;
  estado: string;
}

export interface RES_Producto_Local {
  id_producto: number;
  id_unidad_medida_base: number;
  nombre: string;
  unidad_medida_base_abv: string;
  unidad_medida_base: string;
  id_categoria: number;
  es_consumible: boolean;
  ids_categorias_consumidoras: string | null; // Viene como "1,2,3" desde PHP GROUP_CONCAT
}

export interface RES_Unidad_Local {
  id_unidad_medida: number;
  nombre: string;
  abreviatura: string;
}

export interface RES_DataRegistro {
  minas: RES_Mina_Local[];
  productos: RES_Producto_Local[];
  unidades: RES_Unidad_Local[];
}

export interface RES_DataByMina {
  almacenes: RES_Almacen_Local[];
  labores: RES_Labor_Local[];
}
