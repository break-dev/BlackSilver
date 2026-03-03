export interface RES_Almacen {
    id_almacen: number;
    nombre: string;
    descripcion?: string;
    es_principal: boolean | number;
    estado: string;
    responsable_actual?: string;
    minas_count?: number;
}

export interface RES_ResponsableAlmacen {
    id_responsable_almacen: number;
    id_usuario: number;
    nombres: string;
    apellidos: string;
    fecha_inicio: string;
    fecha_fin: string | null;
    estado: string;
}

export interface RES_MinaAsignada {
    id_almacen_mina: number;
    mina: string;
    concesion: string;
}
