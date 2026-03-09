import { api } from "../../shared/api";
import type { IRespuesta } from "../../shared/response";
import type { DTO_CrearLabor } from "./labores.requests";
import type {
  RES_EmpresaEjecutoraMina,
  RES_Labor,
  RES_TipoLabor,
} from "./labores.responses";

const BASE = "/labores";

export const LaboresService = {
  getLabores: (id_mina: number) =>
    api.get<IRespuesta<RES_Labor[]>>(BASE, { params: { id_mina } }),

  getTiposLabor: () => api.get<IRespuesta<RES_TipoLabor[]>>(`${BASE}/tipos`),

  getEmpresasEjecutoras: (id_mina: number) =>
    api.get<IRespuesta<RES_EmpresaEjecutoraMina[]>>(
      `${BASE}/empresas-ejecutoras`,
      {
        params: { id_mina },
      },
    ),

  crearLabor: (dto: DTO_CrearLabor) =>
    api.post<IRespuesta<RES_Labor>>(BASE, dto),

  updateLabor: (dto: DTO_CrearLabor & { id_labor: number }) =>
    api.put<IRespuesta<null>>(BASE, dto),

  deleteLabor: (id_labor: number) =>
    api.delete<IRespuesta<null>>(BASE, { params: { id_labor } }),
};
