export interface RES_Producto {
    id_producto: number;
    id_categoria: number;
    categoria: string;
    id_unidad_medida_base: number;
    unidad_medida_base: string;
    unidad_medida_abreviatura: string;
    nombre: string;
    es_fiscalizado: boolean;
    es_perecible: boolean;
    stock_minimo: number;
    tiempo_espera_vencimiento: number | null;
    periodo_espera_vencimiento: string | null;
    dias_espera_vencimiento: number | null;
    estado: string;
}
