export interface RES_Mina {
    id_mina: number;
    id_concesion: number;
    concesion: string; // Nombre de la concesión asociada
    nombre: string;
    descripcion?: string;
    estado: string;
    // Campos opcionales para conteos en listados
    labores_count?: number;
    empresas_count?: number;
    responsables_count?: number;
    responsable_actual?: string;
}

export interface RES_EmpresaMina {
    id_empresa_mina: number;
    id_empresa: number;
    ruc: string;
    razon_social: string;
    nombre_comercial: string;
    estado: string;
}

export interface RES_ResponsableMina {
    id_asignacion: number;
    id_usuario: number;
    nombres: string;
    apellidos: string;
    fecha_inicio: string;
    fecha_fin: string | null;
    estado: string;
}
