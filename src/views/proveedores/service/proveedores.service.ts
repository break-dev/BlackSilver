import { api } from "../../../service/api";
import type {
  CrearBancoRequest,
  CrearCuentaBancariaRequest,
  CrearProveedorRequest,
} from "./proveedores.requests";
import type {
  BancoResponse,
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
  ): Promise<{ id_proveedor: number }> => {
    const { data } = await api.post("/proveedores", payload);
    return data.data;
  },

  getBancos: async (): Promise<BancoResponse[]> => {
    const { data } = await api.get("/proveedores/bancos");
    return data.data;
  },
  crearBanco: async (
    payload: CrearBancoRequest,
  ): Promise<{ id_banco: number }> => {
    const { data } = await api.post("/proveedores/bancos", payload);
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
  ): Promise<{ id_cuenta_bancaria: number }> => {
    const { data } = await api.post("/proveedores/cuentas-bancarias", payload);
    return data.data;
  },
};
