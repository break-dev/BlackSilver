export interface RES_MovimientoKardex {
    id_kardex: number;
    id_lote_producto: number;
    id_producto?: number;
    tipo_origen: string;
    tipo_movimiento: string;
    stock_anterior: number | string;
    stock_anterior_base: number | string;
    cantidad_movimiento: number | string;
    cantidad_movimiento_base: number | string;
    stock_resultante: number | string;
    stock_resultante_base: number | string;
    descripcion?: string | null;
    created_at: string;
    producto?: string;
    codigo_lote?: string;
}
