import type { EstadoBase } from "../../../shared/enums/_generic/estado-base";
import type { TipoEntidad } from "../../../shared/enums/_generic/tipo-entidad";
import type { IArchivo } from "../../../shared/interfaces/archivo";

export interface CompraCarbonResumen {
  id_compra_carbon: number;
  id_empresa: number;
  empresa: string;
  id_proveedor: number;
  proveedor: string;
  proveedor_tipo_entidad: TipoEntidad | string;
  proveedor_ruc: string | null;
  proveedor_dni: string | null;
  id_empleado_registro: number;
  empleado_registro: string;
  id_empleado_aprueba: number | null;
  empleado_aprueba: string | null;
  porcentaje_igv: number;
  correlativo: string;
  numero_correlativo: number;
  fecha_hora_ingreso: string;
  fecha_hora_aprobacion: string | null;
  total: number;
  created_at: string;
  estado: EstadoBase | string | null;
  cantidad_items: number;
  evidencias: IArchivo[];
}

export interface DetalleCompraCarbon {
  id_detalle_compra_carbon: number;
  id_tipo_carbon: number;
  tipo_carbon_nombre: string;
  tipo_carbon_codigo: string | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface CompraCarbonDetalle {
  cabecera: Omit<
    CompraCarbonResumen,
    | "id_empleado_registro"
    | "id_empleado_aprueba"
    | "porcentaje_igv"
    | "numero_correlativo"
    | "created_at"
    | "estado"
    | "cantidad_items"
    | "proveedor_tipo_entidad"
    | "proveedor_ruc"
    | "proveedor_dni"
  > & {
    id_empleado_registro: number;
    empleado_registro: string;
    id_empleado_aprueba: number | null;
    empleado_aprueba: string | null;
    porcentaje_igv: number;
    numero_correlativo: number;
    created_at: string;
    estado: EstadoBase | string | null;
    proveedor_tipo_entidad: TipoEntidad | string;
    proveedor_ruc: string | null;
    proveedor_dni: string | null;
    evidencias: IArchivo[];
  };
  detalles: DetalleCompraCarbon[];
}
