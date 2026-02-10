import { api } from "../api";
import type { IRespuesta } from "../../shared/response";
import type { DTO_Login } from "./dtos/requests";
import type { RES_Login } from "./dtos/responses";
import { AuthStore } from "../../stores/auth.store";
import type { IUseHook } from "../hook.interface";

export const useUsuario = ({ setIsLoading, setError }: IUseHook) => {
  // inicio de sesion
  const login = async (dto: DTO_Login) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.post<IRespuesta<RES_Login>>("/api/login", dto);
      const result = response.data;

      if (result.success) {
        AuthStore.getState().updateAuth(result.data as RES_Login);
        return true; // Login successful
      } else {
        setError(result.error);
        return false;
      }
    } catch (error) {
      setError(String(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
  };
};
