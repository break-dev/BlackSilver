import { Estado_RequerimientoDetalle } from "../../../shared/enums/requerimiento-almacen/requerimiento";

export interface DTO_AtencionCambiarEstado {
    id_requerimiento_almacen_detalle?: number;
    ids_detalles?: number[];
    nuevo_estado: Estado_RequerimientoDetalle;
    comentario_decision?: string; 
}

export interface DTO_RegistrarEntrega {
    id_requerimiento: number;
    id_empleado_recibe: number;
    fecha_entrega: string;
    observacion?: string;
    evidencias?: File[];
    detalles: DTO_RegistrarEntregaDetalle[];
}

export interface DTO_RegistrarEntregaDetalle {
    id_requerimiento_almacen_detalle: number; 
    id_lote_producto: number; 
    cantidad_base: number; 
    cantidad_lote: number; 
    cantidad_requerimiento: number; 
}

export interface DTO_CrearSolicitudLogistica {
    id_requerimiento: number;
    observacion?: string;
    premura: string;
    fecha_entrega_requerida: string;
    detalles: {
        id_requerimiento_almacen_detalle: number;
        id_producto: number;
        id_unidad_medida: number;
        cantidad_solicitada: number;
        contenido_por_presentacion: number;
        cantidad_solicitada_base: number;
        comentario?: string;
    }[];
}
