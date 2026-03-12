import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";
import type {
  DTO_RegistroArea,
  DTO_RegistroCargo,
} from "./organigrama.requests";
import type { RES_Area, RES_Cargo } from "./organigrama.responses";

export class OrganigramaService {
  private static PATH = "/organigrama";

  // ÁREAS
  public static get_areas = async (): Promise<IRespuesta<RES_Area[]>> => {
    const { data } = await api.get(`${this.PATH}/areas`);
    return data;
  };

  public static crear_area = async (
    dto: DTO_RegistroArea,
  ): Promise<IRespuesta<RES_Area>> => {
    const { data } = await api.post(`${this.PATH}/areas`, dto);
    return data;
  };

  // CARGOS
  public static get_cargos = async (
    id_area: number,
  ): Promise<IRespuesta<RES_Cargo[]>> => {
    const { data } = await api.get(`${this.PATH}/cargos/${id_area}`);
    return data;
  };

  public static crear_cargo = async (
    dto: DTO_RegistroCargo,
  ): Promise<IRespuesta<RES_Cargo>> => {
    const { data } = await api.post(`${this.PATH}/cargos`, dto);
    return data;
  };

  public static cambiar_estado_cargo = async (
    id_cargo: number,
  ): Promise<IRespuesta<null>> => {
    const { data } = await api.patch(`${this.PATH}/cargos/${id_cargo}/estado`);
    return data;
  };
}
