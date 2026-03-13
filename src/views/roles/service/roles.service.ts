import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";
import type { DTO_RegistroRol } from "./roles.requests";
import type { RES_Rol, RES_ModuloEstructura } from "./roles.responses";

export class RolesService {
  private static PATH = "/roles";

  public static get_roles = async (): Promise<IRespuesta<RES_Rol[]>> => {
    const { data } = await api.get(`${this.PATH}`);
    return data;
  };

  public static get_estructura_permisos = async (): Promise<
    IRespuesta<RES_ModuloEstructura[]>
  > => {
    const { data } = await api.get(`${this.PATH}/estructura-permisos`);
    return data;
  };

  public static crear_rol = async (
    dto: DTO_RegistroRol,
  ): Promise<IRespuesta<RES_Rol>> => {
    const { data } = await api.post(`${this.PATH}`, dto);
    return data;
  };
}
