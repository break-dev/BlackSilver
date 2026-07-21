import { api } from "../../../service/_api";
import type { RES_Oficina } from "../../../service/responses/oficina";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { DTO_RegistroOficina } from "./oficinas.requests";

export class OficinasService {
  private static PATH = "/empresas/oficinas";

  public static crear_oficina = async (
    data: DTO_RegistroOficina,
  ): Promise<IRespuesta<RES_Oficina>> => {
    const { data: response } = await api.post(`${this.PATH}`, data);
    return response;
  };
}
