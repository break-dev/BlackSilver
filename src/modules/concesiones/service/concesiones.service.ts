import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type {
  DTO_CrearConcesion,
  DTO_CrearContrato,
} from "./concesiones.requests";
import type {
  RES_Concesion,
  RES_Contrato,
  RES_Empresa,
} from "./concesiones.responses";

const PATH = "/concesiones";

export const ConcesionesService = {
  get_concesiones: async (): Promise<IRespuesta<RES_Concesion[]>> => {
    const { data } = await api.get(PATH);
    return data;
  },

  crear_concesion: async (
    dto: DTO_CrearConcesion,
  ): Promise<IRespuesta<RES_Concesion>> => {
    const { data } = await api.post(PATH, dto);
    return data;
  },

  get_empresas: async (): Promise<IRespuesta<RES_Empresa[]>> => {
    const { data } = await api.get(`${PATH}/contratos/empresas`);
    return data;
  },

  get_contratos: async (
    id_concesion: number,
  ): Promise<IRespuesta<RES_Contrato[]>> => {
    const { data } = await api.get(`${PATH}/contratos/${id_concesion}`);
    return data;
  },

  crear_contrato: async (
    dto: DTO_CrearContrato,
  ): Promise<IRespuesta<RES_Contrato>> => {
    const { data } = await api.post(`${PATH}/contratos`, dto);
    return data;
  },

  terminar_contrato: async (id_contrato: number): Promise<IRespuesta<null>> => {
    const { data } = await api.delete(`${PATH}/contratos/${id_contrato}`);
    return data;
  },
};
