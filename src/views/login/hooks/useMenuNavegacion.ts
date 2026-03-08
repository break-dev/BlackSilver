import { api } from "../../shared/api";
import type { IRespuesta } from "../../shared/response";
import type { IUseHook } from "../../shared/hook.interface";
import type { IModulo } from "./responses";
import { useMenuNavegacionStore } from "../../stores/menu.store";

export const useMenuNavegacion = ({ setError }: IUseHook) => {
  // obtener y setear menu de navegacion
  const getMenuNavegacion = async () => {
    setError(""); // limpiar errores previos
    try {
      const response = await api.get<IRespuesta<IModulo[]>>("/menu_navegacion");
      const result = response.data;

      if (result.success) {
        useMenuNavegacionStore.getState().updateMenu(result.data as IModulo[]);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError(String(error));
    }
  };

  return {
    getMenuNavegacion,
  };
};
