import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";
import type { RES_Cotizacion } from "./cotizaciones.responses";
import type { DTO_RegistrarComparativo } from "./cotizaciones.requests";

export const CotizacionesService = {
  /**
   * Obtener todas las cotizaciones agrupadas por comparativo
   */
  get_cotizaciones: async (): Promise<IRespuesta<RES_Cotizacion[]>> => {
    const { data } = await api.get<IRespuesta<RES_Cotizacion[]>>("/cotizaciones");
    return data;
  },

  /**
   * Registrar un comparativo masivo con sus cotizaciones
   */
  registrar_comparativo: async (dto: DTO_RegistrarComparativo): Promise<IRespuesta<null>> => {
    const { data } = await api.post<IRespuesta<null>>("/cotizaciones/registrar", dto);
    return data;
  },
};
