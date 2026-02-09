
import type { EstadoBase, TipoLabor, TipoSostenimiento } from "../../../../shared/enums";

export interface DTO_CrearLabor {
    id_concesion: number;
    nombre: string;
    descripcion?: string;
    tipo_labor: TipoLabor;
    tipo_sostenimiento: TipoSostenimiento;
    estado?: EstadoBase;
}

export interface DTO_EditarLabor extends Partial<DTO_CrearLabor> {
    id_labor: number; // Back returns 'id_labor', not 'id'
}

export interface RES_Labor {
    id_labor: number; // Primary Key from Back
    id_concesion: number;
    concesion?: string; // Back returns concession name
    nombre: string;
    descripcion?: string;
    tipo_labor: TipoLabor;
    tipo_sostenimiento: TipoSostenimiento;
    estado: EstadoBase;
    created_at?: string;
    updated_at?: string;
}
