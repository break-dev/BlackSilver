export interface RES_MovimientoKardex {
    id: number;
    id_lote_producto: number;
    codigo_movimiento: string;
    tipo_movimiento: string;
    cantidad_anterior: number;
    cantidad_movimiento: number;
    cantidad_resultante: number;
    glosa?: string;
    created_at: string;
    estado: string;
    producto?: string; // Nombre del producto (para listado global)
    codigo_lote?: string; // Código del lote (para listado global)
}
