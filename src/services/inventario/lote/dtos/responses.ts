export interface RES_Lote {
    id_lote: number;
    id_producto: number;
    producto: string;
    categoria: string;
    id_unidad_medida: number;
    unidad_medida: string;
    id_almacen: number;
    descripcion?: string;
    codigo_lote: string;
    stock_actual: number;
    fecha_ingreso: string;
    fecha_vencimiento?: string | null;
    estado: string;
}

export interface RES_ProductoDisponible {
    id_producto: number;
    nombre: string;
    categoria: string;
    es_perecible: 0 | 1;
}

export interface RES_UnidadMedida {
    id_unidad_medida: number;
    nombre: string;
    abreviatura: string;
    estado: string;
}
