import { Premura, EstadoRequerimiento } from "../../../../shared/enums";

export interface RES_RequerimientoAlmacen {
    id_requerimiento: number;
    solicitante: string;
    mina: string;
    labor?: string;
    almacen_destino: string;
    codigo_requerimiento: string;
    premura: Premura;
    estado: EstadoRequerimiento;
    created_at: string;
    fecha_entrega_requerida: string;
    detalles?: RES_RequerimientoDetalle[];
}

export interface RES_RequerimientoDetalle {
    id: number;
    id_requerimiento: number;
    id_producto: number;
    producto_nombre: string;
    id_unidad_medida: number;
    unidad_medida_nombre: string;
    unidad_medida_abreviatura: string;
    cantidad_solicitada: number;
    cantidad_atendida: number;
    comentario?: string;
    comentario_rechazo?: string;
    estado: string;
}

export interface RES_RequerimientoDetalleCompleto {
    id_requerimiento: number;
    codigo_requerimiento: string;
    solicitante: string;
    mina: string;
    almacen_destino: string;
    premura: string;
    fecha_entrega_requerida: string | null;
    created_at: string;
    estado: string;
    labores: { id: number; nombre: string }[];
    detalles: {
        id_requerimiento_detalle: number;
        producto: string;
        es_fiscalizado: boolean | number;
        es_perecible: boolean | number;
        unidad_medida: string;
        cantidad_solicitada: number;
        cantidad_atendida: number;
        comentario: string | null;
        estado: string;
    }[];
}

export interface RES_TrazabilidadEvento {
    id: number;
    glosa: string;
    estado: string;
    created_at: string;
    usuario: string;
}
