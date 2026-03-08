import { api } from "../../../shared/api";
import type { IRespuesta } from "../../../shared/interfaces";
import type {
  DTO_CrearAlmacen,
  DTO_NuevoResponsable,
} from "./almacenes.requests";
import type {
  RES_Almacen,
  RES_MinaDisponible,
  RES_MinaAbastecida,
  RES_EmpleadoDisponible,
  RES_ResponsableAlmacen,
} from "./almacenes.responses";

export class AlmacenesService {
  private static PATH = "/almacenes";

  // ALMACENES

  public static get_almacenes = async (): Promise<
    IRespuesta<RES_Almacen[]>
  > => {
    const { data } = await api.get(`${this.PATH}`);
    return data;
  };

  public static crear_almacen = async (
    dto: DTO_CrearAlmacen,
  ): Promise<IRespuesta<RES_Almacen>> => {
    const { data } = await api.post(`${this.PATH}`, dto);
    return data;
  };

  // RESPONSABLES

  public static get_historial_responsables = async (
    id_almacen: number,
  ): Promise<IRespuesta<RES_ResponsableAlmacen[]>> => {
    const { data } = await api.get(`${this.PATH}/responsables/${id_almacen}`);
    return data;
  };

  public static nuevo_responsable = async (
    dto: DTO_NuevoResponsable,
  ): Promise<IRespuesta<RES_ResponsableAlmacen>> => {
    const { data } = await api.post(`${this.PATH}/responsables`, dto);
    return data;
  };

  public static get_empleados = async (
    id_almacen: number,
  ): Promise<IRespuesta<RES_EmpleadoDisponible[]>> => {
    const { data } = await api.post(
      `${this.PATH}/responsables/empleados/${id_almacen}`,
    );
    return data;
  };

  // ABASTECIMIENTO DE MINAS

  public static get_minas_abastecidas = async (
    id_almacen: number,
  ): Promise<IRespuesta<RES_MinaAbastecida[]>> => {
    const { data } = await api.get(
      `${this.PATH}/abastecimiento-minas/${id_almacen}`,
    );
    return data;
  };

  public static nueva_mina_por_abastecer = async (
    id_almacen: number,
    id_mina: number,
  ): Promise<IRespuesta<RES_MinaAbastecida>> => {
    const { data } = await api.post(`${this.PATH}/abastecimiento-minas`, {
      id_almacen: id_almacen,
      id_mina: id_mina,
    });
    return data;
  };

  public static eliminar_abastecimiento_mina = async (
    id_almacen_mina: number,
  ): Promise<IRespuesta<null>> => {
    const { data } = await api.delete(
      `${this.PATH}/abastecimiento-minas/${id_almacen_mina}`,
    );
    return data;
  };

  public static get_minas = async (
    id_almacen: number,
  ): Promise<IRespuesta<RES_MinaDisponible[]>> => {
    const { data } = await api.get(
      `${this.PATH}/abastecimiento-minas/minas/${id_almacen}`,
    );
    return data;
  };
}
