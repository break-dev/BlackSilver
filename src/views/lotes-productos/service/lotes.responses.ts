import type { EstadoVencimiento } from "../../../shared/enums/estados";

export interface RES_Lote {
  id_lote: number;
  id_producto: number;
  id_almacen: number;
  id_unidad_medida: number;
  producto: string;
  unidad_medida_base: string;
  categoria: string | null;
  unidad_medida: string;
  descripcion: string | null;
  correlativo: string;
  stock_actual: number;
  contenido_por_presentacion: number;
  stock_actual_base: number;
  fecha_hora_ingreso: string;
  fecha_vencimiento: string | null;
  estado: string;
  es_perecible: number | boolean;
  es_fiscalizado: number | boolean;
  stock_minimo: number;
  dias_espera_vencimiento: number | null;
  dias_para_vencer: number | null;
  estado_vencimiento: EstadoVencimiento;
}

export interface RES_ProductoDisponible {
  id_producto: number;
  id_unidad_medida_base: number;
  nombre: string;
  es_perecible: 0 | 1;
  es_fiscalizado: 0 | 1;
  stock_minimo: number;
  tiempo_espera_vencimiento: number | null;
  periodo_espera_vencimiento: string | null;
  dias_espera_vencimiento: number | null;
}

export interface RES_UnidadMedida {
  id_unidad_medida: number;
  nombre: string;
  abreviatura: string;
}

export interface RES_Almacen {
  id_almacen: number;
  nombre: string;
}
