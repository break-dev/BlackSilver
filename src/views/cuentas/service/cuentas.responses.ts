export interface RES_Cuenta {
    id_usuario: number;
    username: string;
    estado: string;
    id_rol: number;
    id_empleado: number;
    nombre_rol: string;
    nombre_empleado: string;
    apellido_empleado: string;
    id_empresa_pertenece: number;
    path_foto: string | null;
    empresa_pertenece: string;
    empresas_acceso: string | null; // Concatenated string from backend
}

export interface RES_EmpleadoDisponible {
    id: number;
    nombre: string;
    apellido: string;
    dni: string | null;
    id_empresa_pertenece: number;
}

export interface RES_RolDisponible {
    id: number;
    nombre: string;
}

export interface RES_EmpresaAcceso {
    id_empresa: number;
    razon_social: string;
    nombre_comercial: string;
    abreviatura: string | null;
    path_logo: string | null;
}

export interface RES_EmpresaGestion {
    asignadas: RES_EmpresaAcceso[];
    todas: {
        id: number;
        razon_social: string;
        nombre_comercial: string;
        abreviatura: string | null;
    }[];
}
