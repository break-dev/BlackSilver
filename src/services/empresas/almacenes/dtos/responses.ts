export interface RES_Almacen {
    id_almacen: number;         // Antes id
    id_empresa: number;
    empresa: string;

    // Identificación
    codigo: string;             // Antes correlativo. Ej: ALM-001
    nombre: string;
    descripcion?: string;

    // Estado y Config
    es_principal: number | boolean; // 1 | 0
    estado: string;

    // Contadores y Relaciones
    labores_count: number;
    responsable_actual: string | null; // Nombre completo o null
}

export interface RES_ResponsableAlmacen {
    id_asignacion: number;      // Antes id
    // id_usuario_empresa no viene en el listado, viene nombres/apellidos
    nombres: string;
    apellidos: string;
    fecha_inicio: string;
    fecha_fin: string | null;
    estado: "Activo" | "Inactivo";
}

export interface RES_LaborAsignada {
    id: number; // ID de la relación o ID de la labor (según backend)
    // id_labor no viene explícito en el ejemplo, asumimos que 'id' es el identificador único
    labor: string;      // Antes nombre_labor
    tipo_labor: string;
    concesion?: string;
}
