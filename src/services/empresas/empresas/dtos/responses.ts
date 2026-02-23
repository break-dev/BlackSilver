export interface RES_Empresa {
    id_empresa: number;
    ruc: string;
    razon_social: string;
    nombre_comercial: string;
    abreviatura: string;
    path_logo: string;
}

export interface RES_UsuarioEmpresa {
    id_usuario_empresa: number;
    id_usuario: number;
    nombres: string;
    apellidos: string;
    cargo: string;
}
