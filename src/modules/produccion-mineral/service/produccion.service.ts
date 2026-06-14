import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { RES_LoteMineralEnProduccion } from "./produccion.responses";

const path = "/produccion-mineral";

export const ProduccionService = {
  getResumen: async () => {
    const { data } = await api.get<IRespuesta<RES_LoteMineralEnProduccion[]>>(
      `${path}/resumen`
    );
    return data;
  },

  iniciarProduccion: async (id_lote_mineral: number) => {
    const { data } = await api.post<IRespuesta<unknown>>(`${path}/iniciar`, {
      id_lote_mineral,
    });
    return data;
  },
};
