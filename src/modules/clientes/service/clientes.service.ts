import { api } from "../../../service/_api";
import type { CrearClienteRequest, CrearCuentaBancariaRequest } from "./clientes.requests";
import type { ClienteResponse, CuentaBancariaResponse } from "./clientes.responses";

export class ClientesService {
  static async getClientes(): Promise<ClienteResponse[]> {
    const { data } = await api.get("/clientes");
    return data.data;
  }

  static async crearCliente(
    payload: CrearClienteRequest
  ): Promise<ClienteResponse> {
    const { data } = await api.post("/clientes", payload);
    return data.data;
  }

  static async getCuentasBancarias(
    idCliente: number
  ): Promise<CuentaBancariaResponse[]> {
    const { data } = await api.get(
      `/clientes/cuentas-bancarias/${idCliente}`
    );
    return data.data;
  }

  static async crearCuentaBancaria(
    payload: CrearCuentaBancariaRequest
  ): Promise<CuentaBancariaResponse> {
    const { data } = await api.post("/clientes/cuentas-bancarias", payload);
    return data.data;
  }
}
