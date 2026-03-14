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
