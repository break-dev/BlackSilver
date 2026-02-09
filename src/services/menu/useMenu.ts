import { api } from "../api";
import type { ErrorResponse, IRespuesta } from "../../shared/response";
import type { IUseHook } from "../hook.interface";
import type { IModulo } from "./dtos/menu.dto";
import { MenuStore } from "../../stores/menu.store";

export const useMenu = ({ setIsLoading, setError }: IUseHook) => {
  // setear menu de navegacion
  const setMenuNavegacion = async () => {
    setIsLoading(true);
    setError({} as ErrorResponse);
    try {
      const response = await api.get<IRespuesta<IModulo[]>>(
        "/api/menu_navegacion",
      );
      const result = response.data;

      if (result.success) {
        MenuStore.getState().updateMenu(result.data as IModulo[]);
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
    setMenuNavegacion,
  };
};
