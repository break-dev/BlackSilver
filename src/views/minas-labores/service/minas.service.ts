import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";
import type {
  RES_ConcesionItem,
  RES_EmpleadoDisponible,
  RES_EmpresaDisponible,
  RES_EmpresaEjecutora,
  RES_HistorialResponsable,
  RES_Labor,
  RES_ResumenMina,
  RES_TipoLabor,
} from "./minas.responses";
import type {
  DTO_AsignarEmpresaMina,
  DTO_AsignarResponsable,
  DTO_CrearLabor,
  DTO_CrearMina,
} from "./minas.requests";

const BASE_MINAS = "/minas";

export const MinasService = {
  // Minas
  getConcesionesSesion: () =>
    api.get<IRespuesta<RES_ConcesionItem[]>>(`${BASE_MINAS}/concesiones`),

  getMinasResumen: (id_concesion?: number) =>
    api.get<IRespuesta<RES_ResumenMina[]>>(`${BASE_MINAS}`, {
      params: id_concesion ? { id_concesion } : undefined,
    }),

  crearMina: (dto: DTO_CrearMina) =>
    api.post<IRespuesta<RES_ResumenMina>>(BASE_MINAS, dto),

  // Empresas ejecutoras (Minas)
  getEmpresasEjecutoras: (id_mina: number) =>
    api.get<IRespuesta<RES_EmpresaEjecutora[]>>(
      `${BASE_MINAS}/empresas-ejecutoras`,
      {
        params: { id_mina },
      },
    ),

  getEmpresasDisponibles: (id_concesion: number, id_mina: number) =>
    api.get<IRespuesta<RES_EmpresaDisponible[]>>(
      `${BASE_MINAS}/empresas-ejecutoras/empresas-disponibles`,
      {
        params: { id_concesion, id_mina },
      },
    ),

  asignarEmpresa: (dto: DTO_AsignarEmpresaMina) =>
    api.post<IRespuesta<RES_EmpresaEjecutora>>(
      `${BASE_MINAS}/empresas-ejecutoras`,
      dto,
    ),

  // Responsables
  getHistorialResponsables: (id_mina: number) =>
    api.get<IRespuesta<RES_HistorialResponsable[]>>(
      `${BASE_MINAS}/responsables`,
      {
        params: { id_mina },
      },
    ),

  getEmpleadosDisponibles: (id_mina: number) =>
    api.get<IRespuesta<RES_EmpleadoDisponible[]>>(
      `${BASE_MINAS}/responsables/empleados-disponibles`,
      {
        params: { id_mina },
      },
    ),

  asignarResponsable: (dto: DTO_AsignarResponsable) =>
    api.post<IRespuesta<RES_HistorialResponsable>>(
      `${BASE_MINAS}/responsables/asignar-responsable`,
      dto,
    ),

  // Labores
  getLabores: (id_mina: number) =>
    api.get<IRespuesta<RES_Labor[]>>(`${BASE_MINAS}/labores`, {
      params: { id_mina },
    }),

  getTiposLabor: () =>
    api.get<IRespuesta<RES_TipoLabor[]>>(`${BASE_MINAS}/labores/tipos`),

  crearLabor: (dto: DTO_CrearLabor) =>
    api.post<IRespuesta<RES_Labor>>(`${BASE_MINAS}/labores`, dto),

  finalizarLabor: (dto: { id_labor: number; fecha_cierre: string }) =>
    api.post<IRespuesta<RES_Labor>>(`${BASE_MINAS}/labores/finalizar`, dto),
};
