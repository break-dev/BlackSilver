import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces/menu-navegacion";
import type { DTO_Login } from "./login.requests";
import type { RES_Login } from "./login.responses";

export class LoginService {
  private static PATH = "/login";
  public static login = async (
    dto: DTO_Login,
  ): Promise<IRespuesta<RES_Login>> => {
    const { data } = await api.post(`${this.PATH}`, dto);
    return data;
  };
}
