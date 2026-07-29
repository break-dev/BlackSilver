import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type {
  RES_ConcesionItem,
  RES_EmpresaEjecutora,
  RES_HistorialResponsable,
  RES_ResumenLabor,
  RES_ResumenMina,
  RES_TipoLabor,
} from "./minas.responses";
import type {
  DTO_AsignarEmpresaMina,
  DTO_AsignarResponsable,
  DTO_CrearLabor,
  DTO_CrearMina,
} from "./minas.requests";
import type { RES_Empresa } from "../../../service/responses/empresa";

const BASE_MINAS = "/minas";

export const MinasService = {
  // Minas
  getConcesionesSesion: async () => {
    const res = await api.get<IRespuesta<RES_ConcesionItem[]>>(
      `${BASE_MINAS}/aux/concesiones`,
    );
    return res.data;
  },

  getMinasResumen: async (id_concesion?: number) => {
    const res = await api.get<IRespuesta<RES_ResumenMina[]>>(`${BASE_MINAS}`, {
      params: id_concesion ? { id_concesion } : undefined,
    });
    return res.data;
  },

  crearMina: async (dto: DTO_CrearMina) => {
    const res = await api.post<IRespuesta<RES_ResumenMina>>(BASE_MINAS, dto);
    return res.data;
  },

  // Empresas ejecutoras (Minas)
  getEmpresasEjecutoras: async (id_mina: number) => {
    const res = await api.get<IRespuesta<RES_EmpresaEjecutora[]>>(
      `${BASE_MINAS}/empresas-ejecutoras`,
      {
        params: { id_mina },
      },
    );
    return res.data;
  },

  getEmpresasDisponibles: async (id_concesion: number, id_mina: number) => {
    const res = await api.get<IRespuesta<RES_Empresa[]>>(
      `${BASE_MINAS}/empresas-ejecutoras/empresas-disponibles`,
      {
        params: { id_concesion, id_mina },
      },
    );
    return res.data;
  },

  asignarEmpresa: async (dto: DTO_AsignarEmpresaMina) => {
    const res = await api.post<IRespuesta<RES_EmpresaEjecutora>>(
      `${BASE_MINAS}/empresas-ejecutoras`,
      dto,
    );
    return res.data;
  },

  // Responsables
  getHistorialResponsables: async (id_mina: number) => {
    const res = await api.get<IRespuesta<RES_HistorialResponsable[]>>(
      `${BASE_MINAS}/responsables`,
      {
        params: { id_mina },
      },
    );
    return res.data;
  },

  asignarResponsable: async (dto: DTO_AsignarResponsable) => {
    const res = await api.post<IRespuesta<RES_HistorialResponsable>>(
      `${BASE_MINAS}/responsables/asignar-responsable`,
      dto,
    );
    return res.data;
  },

  inactivarResponsable: async (
    id_responsable_mina: number,
    fecha_fin: string,
  ) => {
    const res = await api.post<IRespuesta<null>>(
      `${BASE_MINAS}/responsables/inactivar-responsable`,
      { id_responsable_mina, fecha_fin },
    );
    return res.data;
  },

  // Labores
  getLabores: async (id_mina: number) => {
    const res = await api.get<IRespuesta<RES_ResumenLabor[]>>(
      `${BASE_MINAS}/labores`,
      {
        params: { id_mina },
      },
    );
    return res.data;
  },

  getTiposLabor: async () => {
    const res = await api.get<IRespuesta<RES_TipoLabor[]>>(
      `${BASE_MINAS}/labores/tipos`,
    );
    return res.data;
  },

  crearLabor: async (dto: DTO_CrearLabor) => {
    const res = await api.post<IRespuesta<RES_ResumenLabor>>(
      `${BASE_MINAS}/labores`,
      dto,
    );
    return res.data;
  },

  finalizarLabor: async (dto: { id_labor: number; fecha_cierre: string }) => {
    const res = await api.post<IRespuesta<RES_ResumenLabor>>(
      `${BASE_MINAS}/labores/finalizar`,
      dto,
    );
    return res.data;
  },
};
