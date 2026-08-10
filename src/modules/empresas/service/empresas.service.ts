import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { IArchivo } from "../../../shared/interfaces/archivo";
import type { RES_EmpresaResumen } from "./empresas.responses";

export class EmpresasService {
  private static PATH = "/empresas";

  public static get_empresas = async (filters?: {
    id_empresa?: number;
    estado?: string;
  }): Promise<IRespuesta<RES_EmpresaResumen[]>> => {
    const { data } = await api.get<IRespuesta<RES_EmpresaResumen[]>>(
      `${this.PATH}`,
      { params: filters },
    );
    return data;
  };

  public static crear_empresa = async (
    data: FormData,
  ): Promise<IRespuesta<RES_EmpresaResumen>> => {
    const { data: response } = await api.post(`${this.PATH}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  };

  public static actualizar_logo = async (
    id_empresa: number,
    logo: File,
  ): Promise<IRespuesta<string>> => {
    const formData = new FormData();
    formData.append("logo", logo);
    const { data: response } = await api.post(
      `${this.PATH}/${id_empresa}/logo`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response;
  };

  public static agregar_documentos = async (
    id_empresa: number,
    archivos: File[],
  ): Promise<IRespuesta<IArchivo[]>> => {
    const formData = new FormData();
    archivos.forEach((f) => formData.append("documentos[]", f));
    const { data: response } = await api.post(
      `${this.PATH}/${id_empresa}/documentos`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response;
  };

  public static eliminar_documento = async (
    id_empresa: number,
    path_relativo: string,
  ): Promise<IRespuesta<IArchivo[]>> => {
    const { data: response } = await api.delete(
      `${this.PATH}/${id_empresa}/documentos`,
      { data: { path_relativo } },
    );
    return response;
  };

  public static actualizar_color_predominante = async (
    id_empresa: number,
    color: string | null,
  ): Promise<IRespuesta<string | null>> => {
    const { data: response } = await api.patch(
      `${this.PATH}/${id_empresa}/color-predominante`,
      { color_predominante: color },
    );
    return response;
  };
}
