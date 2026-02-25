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
    items_pendientes: number;
}

export interface RES_LoteDisponible {
    id_lote: number;
    codigo_lote: string;
    descripcion: string;
    stock_actual: number;
    unidad_medida: string;
    fecha_ingreso: string;
    fecha_vencimiento: string | null;
    dias_para_vencer: number | null;
}
