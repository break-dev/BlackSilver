import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";
import type { DTO_RegistroEmpresa } from "./empresas.requests";
import type { RES_Empresa } from "./empresas.responses";

export class EmpresasService {
  private static PATH = "/empresas";

  public static get_empresas = async (): Promise<IRespuesta<RES_Empresa[]>> => {
    const { data } = await api.get(`${this.PATH}`);
    return data;
  };

  public static crear_empresa = async (
    dto: DTO_RegistroEmpresa,
  ): Promise<IRespuesta<RES_Empresa>> => {
    const { data } = await api.post(`${this.PATH}`, dto);
    return data;
  };
}
