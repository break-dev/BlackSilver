import { api } from "../../../service/_api";
import type { CrearClienteRequest } from "./clientes.requests";
import type { ClienteResponse } from "./clientes.responses";

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
}
