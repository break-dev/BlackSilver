import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { RES_LoteMineralProduccion } from "./produccion.responses";
const path = "/produccion-mineral";

export const ProduccionService = {
  getResumen: async () => {
    const { data } = await api.get<IRespuesta<RES_LoteMineralProduccion[]>>(
      `${path}/resumen`,
    );
    return data;
  },

  iniciarProduccion: async (id_lote_mineral: number) => {
    const { data } = await api.post<IRespuesta<null>>(`${path}/iniciar`, {
      id_lote_mineral,
    });
    return data;
  },

  finalizarProduccion: async (id_lote_mineral: number) => {
    const { data } = await api.post<IRespuesta<null>>(`${path}/finalizar`, {
      id_lote_mineral,
    });
    return data;
  },
};
