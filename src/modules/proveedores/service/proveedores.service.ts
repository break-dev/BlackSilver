import { api } from "../../../service/_api";
import type { RES_Banco } from "../../../service/responses/banco";
import type {
  CrearBancoRequest,
  CrearCuentaBancariaRequest,
  CrearProveedorRequest,
  CrearRepresentanteRequest,
  EditarCuentaBancariaRequest,
} from "./proveedores.requests";

export type {
  CrearBancoRequest,
  CrearCuentaBancariaRequest,
  CrearProveedorRequest,
  CrearRepresentanteRequest,
  EditarCuentaBancariaRequest,
};
import type {
  CuentaBancariaResponse,
  ProveedorResponse,
} from "./proveedores.responses";
import type { RES_PersonalExterno } from "../../../service/responses/personal-externo";

export const ProveedoresService = {
  getProveedores: async (filters?: {
    para_carbon?: boolean;
  }): Promise<ProveedorResponse[]> => {
    const { data } = await api.get("/proveedores", { params: filters });
    return data.data; // Retorna el payload del ApiResponse
  },

  crearProveedor: async (
    payload: CrearProveedorRequest,
  ): Promise<ProveedorResponse> => {
    const { data } = await api.post("/proveedores", {
      tipo_entidad: payload.tipo_entidad,
      paraMantenimiento: payload.para_mantenimiento,
      paraTransporte: payload.para_transporte,
      paraCarbon: payload.para_carbon ?? false,
      dni: payload.dni,
      ruc: payload.ruc,
      razon_social: payload.razon_social,
      direccion: payload.direccion,
      telefono: payload.telefono,
      correo: payload.correo,
      id_departamento: payload.id_departamento,
      id_provincia: payload.id_provincia,
      id_distrito: payload.id_distrito,
    });
    return data.data;
  },

  getBancos: async (): Promise<RES_Banco[]> => {
    const { data } = await api.get("/aux/bancos");
    return data.data;
  },
  crearBanco: async (payload: CrearBancoRequest): Promise<RES_Banco> => {
    const { data } = await api.post("/aux/bancos", payload);
    return data.data;
  },

  getCuentasBancarias: async (
    idProveedor: number,
  ): Promise<CuentaBancariaResponse[]> => {
    const { data } = await api.get(
      `/proveedores/cuentas-bancarias/${idProveedor}`,
    );
    return data.data;
  },
  crearCuentaBancaria: async (
    payload: CrearCuentaBancariaRequest,
  ): Promise<CuentaBancariaResponse> => {
    const { data } = await api.post("/proveedores/cuentas-bancarias", payload);
    return data.data;
  },
  actualizarCuentaBancaria: async (
    id: number,
    payload: EditarCuentaBancariaRequest,
  ): Promise<CuentaBancariaResponse> => {
    const { data } = await api.put(
      `/proveedores/cuentas-bancarias/${id}`,
      payload,
    );
    return data.data;
  },

  /**
   * Crear representante de un proveedor (modulo carbon).
   * El flag es_representante lo establece el backend automaticamente
   * al recibir id_proveedor.
   */
  crearRepresentante: async (
    idProveedor: number,
    payload: CrearRepresentanteRequest,
  ): Promise<RES_PersonalExterno> => {
    const { data } = await api.post("/aux/personal-externo", {
      id_proveedor: idProveedor,
      es_representante: true,
      nombre: payload.nombre,
      apellido: payload.apellido,
      dni: payload.dni,
    });
    return data.data;
  },

  /**
   * Listar representantes de un proveedor.
   */
  getRepresentantesPorProveedor: async (
    idProveedor: number,
  ): Promise<RES_PersonalExterno[]> => {
    const { data } = await api.get("/aux/personal-externo", {
      params: { id_proveedor: idProveedor },
    });
    return data.data;
  },
};