export interface RES_Cargo {
    id_cargo: number; // OLD: id
    nombre: string;
    descripcion?: string;
}

export interface RES_Empleado {
    id_empleado: number; // OLD: id
    nombre: string;
    apellido: string;
    dni: string;
    ruc?: string;
    id_cargo: number;
    cargo: string; // Nombre del cargo
    id_empresa: number;
    empresa: string; // Razón Social o Nombre Comercial
    fecha_nacimiento?: string;
    path_foto?: string;
    estado: string; // "Activo" | "Inactivo"
}
