import { api } from "../api";
import type { ErrorResponse, IRespuesta } from "../../shared/response";
import type { DTO_Login, RES_Login } from "./dtos/usuario.dto";
import { AuthStore } from "../../stores/auth.store";
import type { IUseHook } from "../hook.interface";

export const useUsuario = ({ setIsLoading, setError }: IUseHook) => {
  // inicio de seion
  const login = async (dto: DTO_Login) => {
    setIsLoading(true);
    setError({} as ErrorResponse);
    try {
      const response = await api.post<IRespuesta<RES_Login>>("/api/login", dto);
      const result = response.data;

      if (result.success) {
        AuthStore.getState().updateAuth(result.data as RES_Login);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error as ErrorResponse);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
  };
};
