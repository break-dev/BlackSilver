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
}

export interface RES_EmpresaMina {
    id_empresa_mina: number;
    id_empresa: number;
    ruc: string;
    razon_social: string;
    nombre_comercial: string;
    estado: string;
}
