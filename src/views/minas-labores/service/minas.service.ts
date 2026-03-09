import { api } from "../../shared/api";
import type { IRespuesta } from "../../shared/response";
import type {
  RES_ConcesionItem,
  RES_EmpleadoDisponible,
  RES_EmpresaDisponible,
  RES_EmpresaEjecutora,
  RES_EmpresaEjecutoraMina,
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
  DTO_UpdateLabor,
  DTO_UpdateMina,
} from "./minas.requests";

const BASE_MINAS = "/minas";
const BASE_LABORES = "/labores";

export const MinasService = {
  // Minas
  getConcesionesSesion: () =>
    api.get<IRespuesta<RES_ConcesionItem[]>>(
      `${BASE_MINAS}/concesiones-sesion`,
    ),

  getMinasResumen: (id_concesion: number) =>
    api.get<IRespuesta<RES_ResumenMina[]>>(`${BASE_MINAS}/resumen`, {
      params: { id_concesion },
    }),

  crearMina: (dto: DTO_CrearMina) =>
    api.post<IRespuesta<RES_ResumenMina>>(BASE_MINAS, dto),

  updateMina: (dto: DTO_UpdateMina) =>
    api.put<IRespuesta<null>>(BASE_MINAS, dto),

  deleteMina: (id_mina: number) =>
    api.delete<IRespuesta<null>>(BASE_MINAS, { params: { id_mina } }),

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
      `${BASE_MINAS}/empresas-disponibles`,
      {
        params: { id_concesion, id_mina },
      },
    ),

  asignarEmpresa: (dto: DTO_AsignarEmpresaMina) =>
    api.post<IRespuesta<RES_EmpresaEjecutora>>(
      `${BASE_MINAS}/asignar-empresa`,
      dto,
    ),

  desasignarEmpresa: (id_empresa_mina: number) =>
    api.delete<IRespuesta<null>>(`${BASE_MINAS}/desasignar-empresa`, {
      params: { id_empresa_mina },
    }),

  // Responsables
  getHistorialResponsables: (id_mina: number) =>
    api.get<IRespuesta<RES_HistorialResponsable[]>>(
      `${BASE_MINAS}/historial-responsables`,
      {
        params: { id_mina },
      },
    ),

  getEmpleadosDisponibles: (id_mina: number) =>
    api.get<IRespuesta<RES_EmpleadoDisponible[]>>(
      `${BASE_MINAS}/empleados-disponibles`,
      {
        params: { id_mina },
      },
    ),

  asignarResponsable: (dto: DTO_AsignarResponsable) =>
    api.post<IRespuesta<RES_HistorialResponsable>>(
      `${BASE_MINAS}/asignar-responsable`,
      dto,
    ),

  // Labores
  getLabores: (id_mina: number) =>
    api.get<IRespuesta<RES_Labor[]>>(BASE_LABORES, { params: { id_mina } }),

  getTiposLabor: () =>
    api.get<IRespuesta<RES_TipoLabor[]>>(`${BASE_LABORES}/tipos`),

  getEmpresasLabor: (id_mina: number) =>
    api.get<IRespuesta<RES_EmpresaEjecutoraMina[]>>(
      `${BASE_LABORES}/empresas-ejecutoras`,
      {
        params: { id_mina },
      },
    ),

  crearLabor: (dto: DTO_CrearLabor) =>
    api.post<IRespuesta<RES_Labor>>(BASE_LABORES, dto),

  updateLabor: (dto: DTO_UpdateLabor) =>
    api.put<IRespuesta<null>>(BASE_LABORES, dto),

  deleteLabor: (id_labor: number) =>
    api.delete<IRespuesta<null>>(BASE_LABORES, { params: { id_labor } }),
};
