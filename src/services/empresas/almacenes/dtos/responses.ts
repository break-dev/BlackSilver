export interface RES_Almacen {
    id_almacen: number;
    nombre: string;
    descripcion?: string;
    es_principal: boolean | number;
    estado: string;
    responsable_actual?: string;
    labores_count?: number; // Opcional, si el back lo manda
}

export interface RES_ResponsableAlmacen {
    id_asignacion: number;
    id_usuario: number;
    nombres: string;
    apellidos: string;
    fecha_inicio: string;
    fecha_fin: string | null;
    estado: string;
}

export interface RES_LaborAsignada {
    id: number; // ID de la relación o de la labor? Asumiré ID de la labor o relación.
    labor: string;
    tipo_labor: string;
    mina: string;
}
