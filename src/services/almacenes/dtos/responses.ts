export interface RES_Almacen {
    id_almacen: number;
    nombre: string;
    descripcion?: string;
    es_principal: boolean | number;
    estado: string;
    responsable_actual?: string;
    minas_count?: number; // Opcional, si el back lo manda
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

export interface RES_MinaAsignada {
    id: number; // id_asignacion para desvincular
    mina: string;
    concesion: string;
}
