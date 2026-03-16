import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";
import type { RES_Empresa } from "./empresas.responses";

export class EmpresasService {
  private static PATH = "/empresas";

  public static get_empresas = async (): Promise<IRespuesta<RES_Empresa[]>> => {
    const { data } = await api.get(`${this.PATH}`);
    return data;
  };

  public static crear_empresa = async (
    data: FormData,
  ): Promise<IRespuesta<RES_Empresa>> => {
    const { data: response } = await api.post(`${this.PATH}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  };
}
