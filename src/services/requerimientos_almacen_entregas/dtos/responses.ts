export interface RES_RequerimientoAtencionPendiente {
    id_requerimiento: number;
    codigo_requerimiento: string;
    solicitante: string;
    mina: string;
    premura: string;
    fecha_entrega_requerida: string;
    estado: string;
    created_at: string;
    total_items: number;
}

export interface RES_LoteAtencion {
    id_lote_producto: number;
    codigo_lote: string;
    stock_actual: number;
    unidad_lote: string;
    stock_actual_base: number;
    unidad_base: string;
    fecha_vencimiento: string | null;
    stock_formateado: string;
}

export interface RES_DetalleAtencionItem {
    id_requerimiento_detalle: number;
    id_producto: number;
    producto: string;
    es_perecible: number;
    dias_espera_vencimiento: number | null;
    unidad_medida: string;
    unidad_medida_base: string;
    cantidad_solicitada: number;
    cantidad_solicitada_base: number;
    cantidad_entregada_base: number;
    pendiente_base: number;
    estado: string;
    lotes: RES_LoteAtencion[];
}
