import { api } from "../../../service/_api";
import type { RES_Banco } from "../../../service/responses/banco";
import type {
  CrearBancoRequest,
  CrearCuentaBancariaRequest,
  CrearProveedorRequest,
  EditarCuentaBancariaRequest,
} from "./proveedores.requests";
import type {
  CuentaBancariaResponse,
  ProveedorResponse,
} from "./proveedores.responses";

export const ProveedoresService = {
  getProveedores: async (): Promise<ProveedorResponse[]> => {
    const { data } = await api.get("/proveedores");
    return data.data; // Retorna el payload del ApiResponse
  },
  crearProveedor: async (
    payload: CrearProveedorRequest,
  ): Promise<ProveedorResponse> => {
    const { data } = await api.post("/proveedores", {
      tipo_entidad: payload.tipo_entidad,
      paraMantenimiento: payload.para_mantenimiento,
      paraTransporte: payload.para_transporte,
      dni: payload.dni,
      ruc: payload.ruc,
      razon_social: payload.razon_social,
      direccion: payload.direccion,
      telefono: payload.telefono,
      correo: payload.correo,
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
};
