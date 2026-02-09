import { EstadoBase } from "../../../../shared/enums";

export interface DTO_CrearConcesion {
    id_empresa: number;
    nombre: string;
    estado: EstadoBase;
}

export interface DTO_EditarConcesion extends DTO_CrearConcesion {
    id: number;
}

export interface RES_Concesion {
    id: number;
    id_empresa: number;
    nombre: string;
    estado: EstadoBase;
    // Campos de auditoría opcionales si el back los devuelve
    created_at?: string;
    updated_at?: string;
}
