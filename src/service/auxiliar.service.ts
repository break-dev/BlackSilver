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
import type { TipoBien } from "../shared/enums/_generic/tipo-bien";

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

  get_personal_externo: async (): Promise<
    IRespuesta<RES_PersonalExterno[]>
  > => {
    const { data } = await api.get(`${path}/personal-externo`);
    return data;
  },

  crear_personal_externo: async (nuevoPersonal: {
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
    estado?: string;
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
   * Obtener proveedores
   */
  get_proveedores: async (filters?: {
    id_proveedor?: number;
    estado?: string;
    tipo_entidad?: string;
  }): Promise<IRespuesta<RES_Proveedor[]>> => {
    const { data } = await api.get<IRespuesta<RES_Proveedor[]>>(
      `${path}/proveedores`,
      { params: filters },
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
    con_categorias_consumidoras?: boolean;
    tipo_bien_excluido?: TipoBien;
  }): Promise<IRespuesta<RES_Producto[]>> => {
    const { data } = await api.get<IRespuesta<RES_Producto[]>>(
      `${path}/productos`,
      { params: filters },
    );
    return data;
  },
};
