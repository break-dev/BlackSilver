import { EstadoDetalleRequerimiento } from "../../../shared/enums/estados";

export interface DTO_AtencionCambiarEstado {
    id_requerimiento_almacen_detalle: number;
    nuevo_estado: EstadoDetalleRequerimiento;
    comentario_decision?: string; 
}

export interface DTO_RegistrarEntrega {
    id_requerimiento: number;
    id_empleado_recibe: number;
    fecha_entrega: string;
    observacion?: string;
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
