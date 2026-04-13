import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { RES_Empresa } from "./empresas.responses";

export class EmpresasService {
  private static PATH = "/empresas";

  public static get_empresas = async (): Promise<IRespuesta<RES_Empresa[]>> => {
    const { data } = await api.get(`${this.PATH}`);
    return data;
  };

  public static crear_empresa = async (
    data: FormData,
  ): Promise<IRespuesta<RES_Empresa>> => {
    const { data: response } = await api.post(`${this.PATH}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  };

  public static actualizar_logo = async (
    id_empresa: number,
    logo: File,
  ): Promise<IRespuesta<RES_Empresa>> => {
    const formData = new FormData();
    formData.append("path_logo", logo);

    const { data: response } = await api.post(
      `${this.PATH}/${id_empresa}/logo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response;
  };
}
