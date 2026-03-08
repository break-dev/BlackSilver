import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";
import type {
  DTO_CrearConcesion,
  DTO_CrearContrato,
} from "./concesiones.requests";
import type {
  RES_Concesion,
  RES_Contrato,
  RES_Empresa,
} from "./concesiones.responses";

export class ConcesionesService {
  private static PATH = "/concesiones";

  public static get_concesiones = async (): Promise<
    IRespuesta<RES_Concesion[]>
  > => {
    const { data } = await api.get(`${this.PATH}`);
    return data;
  };

  public static crear_concesion = async (
    dto: DTO_CrearConcesion,
  ): Promise<IRespuesta<RES_Concesion>> => {
    const { data } = await api.post(`${this.PATH}`, dto);
    return data;
  };

  public static get_empresas = async (): Promise<IRespuesta<RES_Empresa[]>> => {
    const { data } = await api.get(`${this.PATH}/contratos/empresas`);
    return data;
  };

  public static get_contratos = async (
    id_concesion: number,
  ): Promise<IRespuesta<RES_Contrato[]>> => {
    const { data } = await api.get(`${this.PATH}/contratos/${id_concesion}`);
    return data;
  };

  public static crear_contrato = async (
    dto: DTO_CrearContrato,
  ): Promise<IRespuesta<null>> => {
    const { data } = await api.post(`${this.PATH}/contratos`, dto);
    return data;
  };

  public static terminar_contrato = async (
    id_contrato: number,
  ): Promise<IRespuesta<null>> => {
    const { data } = await api.delete(`${this.PATH}/contratos/${id_contrato}`);
    return data;
  };
}
