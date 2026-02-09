import { api } from "../api";
import type { IRespuesta } from "../../shared/response";
import type { IUseHook } from "../hook.interface";
import type { IModulo } from "./dtos/menu.dto";
import { MenuStore } from "../../stores/menu.store";

export const useMenu = ({ setIsLoading, setError }: IUseHook) => {
  // obtener y setear menu de navegacion
  const getMenuNavegacion = async () => {
    setIsLoading(true);
    setError(""); // Clear any previous error
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
      setError(String(error));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getMenuNavegacion,
  };
};
