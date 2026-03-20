import { api } from "../../../service/api";
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

const PATH = "/almacenes";

export const AlmacenesService = {
  // ALMACENES
  get_almacenes: async (): Promise<IRespuesta<RES_Almacen[]>> => {
    const { data } = await api.get(PATH);
    return data;
  },

  crear_almacen: async (dto: DTO_CrearAlmacen): Promise<IRespuesta<RES_Almacen>> => {
    const { data } = await api.post(PATH, dto);
    return data;
  },

  // RESPONSABLES
  get_historial_responsables: async (id_almacen: number): Promise<IRespuesta<RES_ResponsableAlmacen[]>> => {
    const { data } = await api.get(`${PATH}/responsables/${id_almacen}`);
    return data;
  },

  nuevo_responsable: async (dto: DTO_NuevoResponsable): Promise<IRespuesta<RES_ResponsableAlmacen>> => {
    const { data } = await api.post(`${PATH}/responsables`, dto);
    return data;
  },

  get_empleados: async (id_almacen: number): Promise<IRespuesta<RES_EmpleadoDisponible[]>> => {
    const { data } = await api.post(`${PATH}/responsables/empleados/${id_almacen}`);
    return data;
  },

  // ABASTECIMIENTO DE MINAS
  get_minas_abastecidas: async (id_almacen: number): Promise<IRespuesta<RES_MinaAbastecida[]>> => {
    const { data } = await api.get(`${PATH}/abastecimiento-minas/${id_almacen}`);
    return data;
  },

  nueva_mina_por_abastecer: async (id_almacen: number, id_mina: number): Promise<IRespuesta<RES_MinaAbastecida>> => {
    const { data } = await api.post(`${PATH}/abastecimiento-minas`, {
      id_almacen,
      id_mina,
    });
    return data;
  },

  eliminar_abastecimiento_mina: async (id_almacen_mina: number): Promise<IRespuesta<null>> => {
    const { data } = await api.delete(`${PATH}/abastecimiento-minas/${id_almacen_mina}`);
    return data;
  },

  get_minas: async (id_almacen: number): Promise<IRespuesta<RES_MinaDisponible[]>> => {
    const { data } = await api.get(`${PATH}/abastecimiento-minas/minas/${id_almacen}`);
    return data;
  },
};
