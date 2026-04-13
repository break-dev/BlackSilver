import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces/menu-navegacion";
import type {
  DTO_AsignarLabores,
  DTO_CrearEmpleado,
} from "./empleados.requests";
import type {
  RES_Area,
  RES_Cargo,
  RES_Empleado,
  RES_Labor,
  RES_LaborEmpleado,
  RES_Mina,
} from "./empleados.responses";

export class EmpleadosService {
  private static PATH = "/empleados";

  public static get_empleados = async (
    idMina?: number,
  ): Promise<IRespuesta<RES_Empleado[]>> => {
    const { data } = await api.get(this.PATH, {
      params: { id_mina: idMina },
    });
    return data;
  };

  public static get_minas = async (): Promise<IRespuesta<RES_Mina[]>> => {
    const { data } = await api.get(`${this.PATH}/minas`);
    return data;
  };

  public static get_areas = async (): Promise<IRespuesta<RES_Area[]>> => {
    const { data } = await api.get(`${this.PATH}/areas`);
    return data;
  };

  public static get_cargos = async (
    idArea: number,
  ): Promise<IRespuesta<RES_Cargo[]>> => {
    const { data } = await api.get(`${this.PATH}/cargos/${idArea}`);
    return data;
  };

  public static crear_empleado = async (
    dto: DTO_CrearEmpleado,
  ): Promise<IRespuesta<RES_Empleado>> => {
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
  ): Promise<IRespuesta<RES_Empleado>> => {
    const formData = new FormData();
    formData.append("path_foto", file);
    const { data } = await api.post(
      `${this.PATH}/foto/${idEmpleado}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data;
  };

  // --- Labores ---

  public static get_labores_disponibles = async (
    idMina: number,
    idEmpleado?: number,
  ): Promise<IRespuesta<RES_Labor[]>> => {
    const { data } = await api.get(`${this.PATH}/labores-mina/${idMina}`, {
      params:
        idEmpleado !== undefined ? { id_empleado: idEmpleado } : undefined,
    });
    return data;
  };

  public static get_labores_empleado = async (
    idEmpleado: number,
  ): Promise<IRespuesta<RES_LaborEmpleado[]>> => {
    const { data } = await api.get(`${this.PATH}/${idEmpleado}/labores`);
    return data;
  };

  public static asignar_labores = async (
    idEmpleado: number,
    dto: DTO_AsignarLabores,
  ): Promise<IRespuesta<RES_LaborEmpleado[]>> => {
    const { data } = await api.post(`${this.PATH}/${idEmpleado}/labores`, dto);
    return data;
  };
}
