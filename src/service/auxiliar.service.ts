import { api } from "./_api";
import type { IRespuesta } from "../shared/interfaces/_response";
import type { RES_Proveedor } from "./responses/proveedor";
import type { RES_UnidadMedida } from "./responses/unidad-medida";
import type { RES_Producto } from "./responses/producto";
import type { RES_Almacen } from "./responses/almacen";
import type { RES_PersonalExterno } from "./responses/personal-externo";
import type { RES_LoteDisponible } from "./responses/lote-producto";
import type { RES_Empleado } from "./responses/empleado";
import type { RES_Empresa } from "./responses/empresa";
import type { RES_Mina } from "./responses/mina";
import type { TipoBien } from "../shared/enums/_generic/tipo-bien";
import type { RES_Marca } from "./responses/marca";
import type { RES_ActivoFijoDisponible } from "./responses/activo-fijo";
import type { EstadoActivoFijo } from "../shared/enums/activo-fijo";
import type { RES_Labor } from "./responses/labor";
import type { RES_Contratista } from "./responses/contratista";
import type { EstadoBase } from "../shared/enums/_generic/estado-base";
import type { TipoEntidad } from "../shared/enums/_generic/tipo-entidad";
import type { TipoProducto } from "../shared/enums/_generic/tipo-producto";
import type { RES_Categoria } from "./responses/categoria";
import type { EstadoLoteMineral } from "../shared/enums/lote-mineral";
import type { RES_LoteMineral } from "./responses/lote-mineral";
import type { RES_Banco } from "./responses/banco";
import type { RES_Area, RES_Cargo } from "./responses/organigrama";
import type { RES_Rol } from "./responses/rol";
import type { RES_Agencia } from "./responses/agencia";
import type { RES_Oficina } from "./responses/oficina";

const path = "/aux";

export const AuxService = {
  /**
   * Obtener almacenes
   */
  get_almacenes: async (filters?: {
    id_almacen?: number;
    id_empleado_responsable?: number;
    es_principal?: boolean;
  }): Promise<IRespuesta<RES_Almacen[]>> => {
    // Transformamos el booleano a 1 o 0 antes de enviarlo
    const params = filters
      ? {
          ...filters,
          ...(filters.es_principal !== undefined && {
            es_principal: filters.es_principal ? 1 : 0,
          }),
        }
      : undefined;

    const { data } = await api.get<IRespuesta<RES_Almacen[]>>(
      `${path}/almacenes`,
      { params },
    );
    return data;
  },

  get_personal_externo: async (filters?: {
    id_personal?: number;
    id_proveedor?: number;
    estado?: EstadoBase;
  }): Promise<IRespuesta<RES_PersonalExterno[]>> => {
    const { data } = await api.get(`${path}/personal-externo`, {
      params: filters,
    });
    return data;
  },

  crear_personal_externo: async (nuevoPersonal: {
    id_proveedor?: number;
    nombre: string;
    apellido?: string;
    dni?: string;
  }): Promise<IRespuesta<RES_PersonalExterno>> => {
    const { data } = await api.post(`${path}/personal-externo`, nuevoPersonal);
    return data;
  },

  get_lotes_disponibles: async (idAlmacen: number, idsProductos: number[]) => {
    const res = await api.get<IRespuesta<RES_LoteDisponible[]>>(
      `${path}/lotes`,
      {
        params: {
          id_almacen: idAlmacen,
          ids_productos: idsProductos,
        },
      },
    );
    return res.data;
  },

  get_empleados: async (filters?: {
    id_empleado?: number;
    estado?: EstadoBase;
    id_almacen_excluyente?: number;
    id_mina_excluyente?: number;
    con_cuenta?: boolean;
  }): Promise<IRespuesta<RES_Empleado[]>> => {
    const { data } = await api.get(`${path}/empleados`, {
      params: filters,
    });
    return data;
  },

  /**
   * Obtener unidades de medida
   */
  get_unidades_medida: async (filters?: {
    id_unidad_medida?: number;
    solo_base?: boolean;
  }): Promise<IRespuesta<RES_UnidadMedida[]>> => {
    // Transformamos el booleano a 1 o 0 antes de enviarlo
    const params = filters
      ? {
          ...filters,
          ...(filters.solo_base !== undefined && {
            solo_base: filters.solo_base ? 1 : 0,
          }),
        }
      : undefined;

    const { data } = await api.get<IRespuesta<RES_UnidadMedida[]>>(
      `${path}/unidades-medida`,
      { params },
    );
    return data;
  },

  /**
   * Obtener categorias
   */
  get_categorias: async (filters?: {
    id_categoria?: number;
    estado?: EstadoBase;
  }): Promise<IRespuesta<RES_Categoria[]>> => {
    const { data } = await api.get<IRespuesta<RES_Categoria[]>>(
      `${path}/categorias`,
      { params: filters },
    );
    return data;
  },

  /**
   * Crear una categoria
   */
  crear_categoria: async (nuevaCategoria: {
    nombre: string;
    tipo_producto: TipoProducto;
    clasificacion_bien: TipoBien;
    descripcion?: string;
    para_transporte?: boolean;
    control_por_odometro?: boolean;
    control_por_horometro?: boolean;
    control_por_vueltas?: boolean;
    es_consumible?: boolean;
    para_cocina?: boolean;
    para_mina?: boolean;
    es_auditable?: boolean;
    ids_categorias_consumidoras?: number[];
  }): Promise<IRespuesta<RES_Categoria>> => {
    const { data } = await api.post<IRespuesta<RES_Categoria>>(
      `${path}/categorias`,
      nuevaCategoria,
    );
    return data;
  },

  /**
   * Obtener proveedores
   */
  get_proveedores: async (filters?: {
    id_proveedor?: number;
    estado?: string;
    tipo_entidad?: string;
    para_mantenimiento?: boolean;
    para_transporte?: boolean;
  }): Promise<IRespuesta<RES_Proveedor[]>> => {
    const { data } = await api.get<IRespuesta<RES_Proveedor[]>>(
      `${path}/proveedores`,
      { params: filters },
    );
    return data;
  },

  get_agencias_transporte: async (): Promise<IRespuesta<RES_Agencia[]>> => {
    const { data } = await api.get<IRespuesta<RES_Agencia[]>>(
      `${path}/agencias-transporte`,
    );
    return data;
  },

  crear_agencia_transporte: async (nuevaAgencia: {
    razon_social: string;
  }): Promise<IRespuesta<RES_Agencia>> => {
    const { data } = await api.post<IRespuesta<RES_Agencia>>(
      `${path}/agencias-transporte`,
      nuevaAgencia,
    );
    return data;
  },

  /**
   * Crear un proveedor
   */
  crear_proveedor: async (nuevoProveedor: {
    tipo_entidad: TipoEntidad;
    razon_social: string;
    para_mantenimiento: boolean;
    para_transporte?: boolean;
    dni?: string;
    ruc?: string;
    direccion?: string;
    telefono?: string;
    correo?: string;
  }): Promise<IRespuesta<RES_Proveedor>> => {
    const { data } = await api.post<IRespuesta<RES_Proveedor>>(
      `${path}/proveedores`,
      {
        tipo_entidad: nuevoProveedor.tipo_entidad,
        razonSocial: nuevoProveedor.razon_social,
        paraMantenimiento: nuevoProveedor.para_mantenimiento,
        paraTransporte: nuevoProveedor.para_transporte,
        dni: nuevoProveedor.dni,
        ruc: nuevoProveedor.ruc,
        direccion: nuevoProveedor.direccion,
        telefono: nuevoProveedor.telefono,
        correo: nuevoProveedor.correo,
      },
    );
    return data;
  },

  get_empresas: async (filters?: {
    id_empresa?: number;
    estado?: string;
  }): Promise<IRespuesta<RES_Empresa[]>> => {
    const { data } = await api.get<IRespuesta<RES_Empresa[]>>(
      `${path}/empresas`,
      { params: filters },
    );
    return data;
  },

  /**
   * Obtener catálogo de productos
   */
  get_productos: async (filters?: {
    tipo_bien_excluido?: TipoBien;
    tipo_bien?: TipoBien;
  }): Promise<IRespuesta<RES_Producto[]>> => {
    const { data } = await api.get<IRespuesta<RES_Producto[]>>(
      `${path}/productos`,
      { params: filters },
    );
    return data;
  },

  /**
   * Crear un producto
   */
  crear_producto: async (nuevoProducto: {
    id_categoria: number;
    id_unidad_medida_base: number;
    nombre: string;
    prefijo?: string;
    es_auditable: boolean;
    es_perecible: boolean;
    para_mantenimiento: boolean;
    stock_minimo_base?: number;
    costo_promedio_base?: number;
    tiempo_espera_vencimiento?: number;
    periodo_espera_vencimiento?: string;
  }): Promise<IRespuesta<RES_Producto>> => {
    const { data } = await api.post<IRespuesta<RES_Producto>>(
      `${path}/productos`,
      {
        id_unidad_medida_base: nuevoProducto.id_unidad_medida_base,
        nombre: nuevoProducto.nombre,
        prefijo: nuevoProducto.prefijo,
        es_auditable: nuevoProducto.es_auditable,
        es_perecible: nuevoProducto.es_perecible,
        para_mantenimiento: nuevoProducto.para_mantenimiento,
        stock_minimo_base: nuevoProducto.stock_minimo_base,
        costo_promedio_base: nuevoProducto.costo_promedio_base,
        tiempo_espera_vencimiento: nuevoProducto.tiempo_espera_vencimiento,
        periodo_espera_vencimiento: nuevoProducto.periodo_espera_vencimiento,
      },
    );
    return data;
  },

  /**
   * Obtener lista de minas
   */
  get_minas: async (filters?: {
    id_mina?: number;
    id_concesion?: number;
    id_empleado_responsable?: number;
    id_almacen_abastece?: number;
  }): Promise<IRespuesta<RES_Mina[]>> => {
    const { data } = await api.get<IRespuesta<RES_Mina[]>>(`${path}/minas`, {
      params: filters,
    });
    return data;
  },

  /**
   * Obtener lista de marcas
   */
  get_marcas: async (filters?: {
    id_marca?: number;
    estado?: string;
  }): Promise<IRespuesta<RES_Marca[]>> => {
    const { data } = await api.get<IRespuesta<RES_Marca[]>>(`${path}/marcas`, {
      params: filters,
    });
    return data;
  },

  /**
   * Crear una nueva marca
   */
  crear_marca: async (nuevaMarca: {
    nombre: string;
  }): Promise<IRespuesta<RES_Marca>> => {
    const { data } = await api.post<IRespuesta<RES_Marca>>(
      `${path}/marcas`,
      nuevaMarca,
    );
    return data;
  },

  get_activos_disponibles: async (filters?: {
    id_activo?: number;
    id_almacen?: number;
    id_mina?: number;
    ids_productos?: number | number[];
    para_transporte?: boolean;
    control_por_odometro?: boolean;
    control_por_horometro?: boolean;
    control_por_vueltas?: boolean;
    estado?: EstadoActivoFijo;
  }): Promise<IRespuesta<RES_ActivoFijoDisponible[]>> => {
    const apiParams = { ...filters };
    const { data } = await api.get<IRespuesta<RES_ActivoFijoDisponible[]>>(
      `${path}/activos-disponibles`,
      { params: apiParams },
    );
    return data;
  },

  /**
   * Obtener labores globalmente
   */
  get_labores: async (filters?: {
    id_mina?: number;
    id_labor?: number;
    id_contratista_excluyente?: number;
  }): Promise<IRespuesta<RES_Labor[]>> => {
    const { data } = await api.get<IRespuesta<RES_Labor[]>>(`${path}/labores`, {
      params: filters,
    });
    return data;
  },

  /**
   * Obtener contratistas
   */
  get_contratistas: async (filters?: {
    id_mina?: number;
  }): Promise<IRespuesta<RES_Contratista[]>> => {
    const { data } = await api.get<IRespuesta<RES_Contratista[]>>(
      `${path}/contratistas`,
      { params: filters },
    );
    return data;
  },

  /**Obtener lotes de mineral */
  get_lotes_mineral: async (filters?: {
    id_lote_mineral?: number;
    id_contratista?: number;
    id_mina?: number;
    id_labor?: number;
    estado?: EstadoLoteMineral;
  }): Promise<IRespuesta<RES_LoteMineral[]>> => {
    const apiParams = { ...filters };
    const { data } = await api.get<IRespuesta<RES_LoteMineral[]>>(
      `${path}/lotes-mineral`,
      { params: apiParams },
    );
    return data;
  },

  registrar_lote: async (nuevoLote: {
    id_contratista: number;
    id_mina: number;
    id_labor: number;
    descripcion?: string | null;
    fecha_inicio_produccion?: string | null;
  }): Promise<IRespuesta<RES_LoteMineral>> => {
    const { data } = await api.post<IRespuesta<RES_LoteMineral>>(
      "/lote-mineral",
      nuevoLote,
    );
    return data;
  },

  get_bancos: async (): Promise<IRespuesta<RES_Banco[]>> => {
    const { data } = await api.get<IRespuesta<RES_Banco[]>>(`${path}/bancos`);
    return data;
  },

  crear_banco: async (nuevoBanco: {
    nombre: string;
    abreviatura: string;
  }): Promise<IRespuesta<RES_Banco>> => {
    const { data } = await api.post<IRespuesta<RES_Banco>>(
      `${path}/bancos`,
      nuevoBanco,
    );
    return data;
  },

  get_areas: async (filters?: {
    id_area?: number;
    estado?: EstadoBase;
    con_cargos?: boolean;
  }): Promise<IRespuesta<RES_Area[]>> => {
    const { data } = await api.get<IRespuesta<RES_Area[]>>(`${path}/areas`, {
      params: filters,
    });
    return data;
  },

  get_cargos: async (filters?: {
    id_cargo?: number;
    id_area?: number;
    estado?: EstadoBase;
    con_area?: boolean;
  }): Promise<IRespuesta<RES_Cargo[]>> => {
    const { data } = await api.get<IRespuesta<RES_Cargo[]>>(`${path}/cargos`, {
      params: filters,
    });
    return data;
  },

  get_roles_disponibles: async (filters?: {
    id_rol?: number;
    estado?: EstadoBase;
  }): Promise<IRespuesta<RES_Rol[]>> => {
    const { data } = await api.get<IRespuesta<RES_Rol[]>>(
      `${path}/roles-disponibles`,
      { params: filters },
    );
    return data;
  },

  get_oficinas: async (filters?: {
    id_cargo?: number | number[];
    id_area?: number | number[];
    estado?: EstadoBase;
  }): Promise<IRespuesta<RES_Oficina[]>> => {
    const { data } = await api.get<IRespuesta<RES_Oficina[]>>(
      `${path}/oficinas`,
      {
        params: filters,
      },
    );
    return data;
  },
};
