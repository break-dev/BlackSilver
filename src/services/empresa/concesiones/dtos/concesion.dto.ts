import { EstadoBase } from "../../../../shared/enums";

export interface DTO_CrearConcesion {
    id_empresa: number;
    nombre: string;
    estado: EstadoBase;
}

export interface DTO_EditarConcesion extends DTO_CrearConcesion {
    id_concesion: number; // Back returns 'id_concesion', not 'id'
}

export interface RES_Concesion {
    id_concesion: number; // Primary Key from Back
    id_empresa: number;
    empresa?: string; // Optional commercial name from Back
    logo_empresa?: string | null;
    nombre: string;
    estado: EstadoBase;
    created_at?: string;
    updated_at?: string;
}
