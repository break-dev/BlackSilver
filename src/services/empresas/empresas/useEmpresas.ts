import { api } from "../../api";
import type { IRespuesta } from "../../../shared/response";
import type { IUseHook } from "../../hook.interface";
import type { RES_Empresa } from "./dtos/responses";

export const useEmpresas = ({ setError }: IUseHook) => {
  const get_empresas_by_session = async (): Promise<RES_Empresa[]> => {
    setError("");
    try {
      const response = await api.get<IRespuesta<RES_Empresa[]>>(
        "/api/empresas/by-session",
      );
      const result = response.data;

      return result.data || [];
    } catch (error) {
      setError(String(error));
      return [];
    }
  };

  return {
    get_empresas_by_session,
  };
};
