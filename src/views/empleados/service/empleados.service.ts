import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";
import type { DTO_CrearEmpleado } from "./empleados.requests";
import type {
  RES_Empleado,
  RES_Area,
  RES_Cargo,
  RES_Empresa,
} from "./empleados.responses";

export class EmpleadosService {
  private static PATH = "/empleados";

  public static get_empleados = async (
    idEmpresa?: number,
  ): Promise<IRespuesta<RES_Empleado[]>> => {
    const { data } = await api.get(this.PATH, {
      params: { id_empresa: idEmpresa },
    });
    return data;
  };

  public static get_empresas = async (): Promise<IRespuesta<RES_Empresa[]>> => {
    const { data } = await api.get(`${this.PATH}/empresas`);
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
    const { data } = await api.post(this.PATH, dto);
    return data;
  };
}
