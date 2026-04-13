import { api } from "./api";
import type { IRespuesta, IModulo } from "../shared/interfaces/menu-navegacion";

export class MenuNavService {
  private static PATH = "/menu-nav";
  public static get_menu_navegacion = async (): Promise<
    IRespuesta<IModulo[]>
  > => {
    const { data } = await api.get(`${this.PATH}`);
    return data;
  };
}
