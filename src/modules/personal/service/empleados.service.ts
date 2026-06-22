import { api } from "../../../service/_api";
import type { RES_Labor } from "../../../service/responses/labor";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type {
  DTO_AsignarLaboresContratista,
  DTO_CrearContratista,
  DTO_CrearEmpleado,
} from "./empleados.requests";
import type {
  RES_ContratistaResumen,
  RES_EmpleadoResumen,
} from "./empleados.responses";

export class EmpleadosService {
  private static PATH = "/empleados";

  public static get_empleados = async (
    idEmpresa?: number,
  ): Promise<IRespuesta<RES_EmpleadoResumen[]>> => {
    const { data } = await api.get(this.PATH, {
      params: { id_empresa: idEmpresa },
    });
    return data;
  };

  public static crear_empleado = async (
    dto: DTO_CrearEmpleado,
  ): Promise<IRespuesta<RES_EmpleadoResumen>> => {
    const formData = new FormData();
    Object.entries(dto).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value instanceof File ? value : String(value));
      }
    });
    const { data } = await api.post(this.PATH, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  };

  public static actualizar_foto = async (
    idEmpleado: number,
    file: File,
  ): Promise<IRespuesta<string>> => {
    const formData = new FormData();
    formData.append("foto", file);
    const { data } = await api.post(
      `${this.PATH}/foto/${idEmpleado}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data;
  };
}

export class ContratistasService {
  private static PATH = "/contratistas";

  public static get_contratistas = async (
    idMina?: number,
  ): Promise<IRespuesta<RES_ContratistaResumen[]>> => {
    const { data } = await api.get(this.PATH, {
      params: { id_mina: idMina },
    });
    return data;
  };

  public static crear_contratista = async (
    dto: DTO_CrearContratista,
  ): Promise<IRespuesta<RES_ContratistaResumen>> => {
    const formData = new FormData();
    Object.entries(dto).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value instanceof File ? value : String(value));
      }
    });
    const { data } = await api.post(this.PATH, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  };

  public static actualizar_foto = async (
    idContratista: number,
    file: File,
  ): Promise<IRespuesta<string>> => {
    const formData = new FormData();
    formData.append("foto", file);
    const { data } = await api.post(
      `${this.PATH}/${idContratista}/foto`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data;
  };
  public static get_labores_disponibles = async (
    idMina: number,
    idContratista?: number,
  ): Promise<IRespuesta<RES_Labor[]>> => {
    const { data } = await api.get(`/aux/labores`, {
      params: {
        id_mina: idMina,
        id_contratista_excluyente: idContratista,
      },
    });
    return data;
  };

  public static asignar_labores = async (
    idContratista: number,
    dto: DTO_AsignarLaboresContratista,
  ): Promise<IRespuesta<RES_ContratistaResumen>> => {
    const { data } = await api.post(
      `${this.PATH}/${idContratista}/labores`,
      dto,
    );
    return data;
  };
}
