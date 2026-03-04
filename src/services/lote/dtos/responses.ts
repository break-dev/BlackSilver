export interface RES_Lote {
    id_lote: number;
    id_producto: number;
    producto: string;
    categoria: string;
    id_unidad_medida: number;
    unidad_medida: string;
    id_almacen: number;
    descripcion: string | null;
    codigo_lote: string;
    stock_actual: number | string;
    contenido_por_presentacion: number | string;
    stock_actual_base: number | string;
    fecha_hora_ingreso: string;
    fecha_vencimiento: string | null;
    estado: string;
    // Alertas y config
    es_perecible: number | boolean;
    stock_minimo: number | string;
    dias_espera_vencimiento: number | null;
    dias_para_vencer: number | null;
    stock_total_almacen: number | string;
}

export interface RES_ProductoDisponible {
    id_producto: number;
    nombre: string;
    categoria: string;
    es_perecible: 0 | 1;
    id_unidad_medida_base: number;
    unidad_medida_base: string;
    stock_minimo: number | string;
}

export interface RES_UnidadMedida {
    id_unidad_medida: number;
    nombre: string;
    abreviatura: string;
    estado: string;
}
