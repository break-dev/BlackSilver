import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces/menu-navegacion";
import type { RES_Perfil } from "./perfil.responses";

export class PerfilService {
  private static PATH = "/perfil";

  public static get_perfil = async (): Promise<IRespuesta<RES_Perfil>> => {
    const { data } = await api.get(`${this.PATH}`);
    return data;
  };
}
