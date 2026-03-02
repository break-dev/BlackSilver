export interface DTO_AtencionCambiarEstado {
    id_requerimiento_almacen_detalle: number;
    nuevo_estado: string;
    comentario_rechazo?: string;
}

export interface DTO_RegistrarEntrega {
    id_requerimiento: number;
    fecha_entrega: string;
    observacion?: string;
    detalles: DTO_RegistrarEntregaDetalle[];
}

export interface DTO_RegistrarEntregaDetalle {
    id_requerimiento_almacen_detalle: number;
    id_lote: number;
    cantidad: number;
}
