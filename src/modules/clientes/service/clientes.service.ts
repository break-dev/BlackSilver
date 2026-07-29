import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type {
  CrearClienteRequest,
  CrearCuentaBancariaRequest,
  EditarCuentaBancariaRequest,
} from "./clientes.requests";
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

  static async actualizarCuentaBancaria(
    id: number,
    payload: EditarCuentaBancariaRequest
  ): Promise<IRespuesta<CuentaBancariaResponse>> {
    const { data } = await api.put<IRespuesta<CuentaBancariaResponse>>(
      `/clientes/cuentas-bancarias/${id}`,
      {
        id_banco: payload.id_banco,
        moneda: payload.moneda,
        numero_cuenta: payload.numero_cuenta,
        cci: payload.cci || null,
        es_para_detraccion: payload.es_para_detraccion,
      }
    );
    return data;
  }
}