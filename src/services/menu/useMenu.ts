import { api } from "../api";
import type { IRespuesta } from "../../shared/response";
import type { IUseHook } from "../hook.interface";
import type { IModulo } from "./dtos/responses";
import { MenuStore } from "../../stores/menu.store";

export const useMenu = ({ setError }: IUseHook) => {
  // obtener y setear menu de navegacion
  const getMenuNavegacion = async () => {
    setError(""); // limpiar errores previos
    try {
      const response = await api.get<IRespuesta<IModulo[]>>(
        "/menu_navegacion",
      );
      const result = response.data;

      if (result.success) {
        MenuStore.getState().updateMenu(result.data as IModulo[]);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(String(error));
    }
  };

  return {
    getMenuNavegacion,
  };
};
