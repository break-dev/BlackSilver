import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { IArchivo } from "../../../shared/interfaces/archivo";
import type {
  DTO_CrearConcesion,
  DTO_CrearContrato,
} from "./concesiones.requests";
import type { RES_Concesion, RES_Contrato } from "./concesiones.responses";

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

  get_contratos: async (
    id_concesion: number,
  ): Promise<IRespuesta<RES_Contrato[]>> => {
    const { data } = await api.get(`${PATH}/contratos/${id_concesion}`);
    return data;
  },

  crear_contrato: async (
    payload: { dto: DTO_CrearContrato; evidencias: File[] },
  ): Promise<IRespuesta<RES_Contrato>> => {
    const formData = new FormData();
    formData.append("id_concesion", String(payload.dto.id_concesion));
    formData.append("id_empresa", String(payload.dto.id_empresa));
    formData.append("fecha_inicio", payload.dto.fecha_inicio);
    if (payload.dto.fecha_fin) {
      formData.append("fecha_fin", payload.dto.fecha_fin);
    }
    payload.evidencias.forEach((file) => {
      formData.append("evidencias[]", file);
    });

    const { data } = await api.post(`${PATH}/contratos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  terminar_contrato: async (id_contrato: number): Promise<IRespuesta<null>> => {
    const { data } = await api.delete(`${PATH}/contratos/${id_contrato}`);
    return data;
  },

  subir_evidencias: async (
    id_contrato: number,
    archivos: File[],
  ): Promise<IRespuesta<IArchivo[]>> => {
    const formData = new FormData();
    formData.append("id_contrato", String(id_contrato));
    archivos.forEach((file) => formData.append("evidencias[]", file));

    const { data } = await api.post(`${PATH}/contratos/evidencias`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  eliminar_evidencia: async (
    id_contrato: number,
    path_relativo: string,
  ): Promise<IRespuesta<IArchivo[]>> => {
    const { data } = await api.delete(`${PATH}/contratos/evidencias`, {
      data: { id_contrato, path_relativo },
    });
    return data;
  },
};