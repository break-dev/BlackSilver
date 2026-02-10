import { EstadoBase, TipoRequerimiento } from "../../../../../shared/enums";

export interface DTO_CrearCategoria {
    nombre: string;
    descripcion: string;
    tipo_requerimiento: TipoRequerimiento;
    estado: EstadoBase;
}

export interface DTO_EditarCategoria extends DTO_CrearCategoria {
    id: number;
}

export interface RES_Categoria {
    id: number; // Primary Key
    nombre: string;
    descripcion: string | null;
    tipo_requerimiento: TipoRequerimiento;
    clasificacion_bien?: string | null;
    estado: EstadoBase;
    created_at?: string;
    updated_at?: string;
}
