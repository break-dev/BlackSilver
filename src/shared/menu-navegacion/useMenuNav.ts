import { useState, useCallback } from "react";
import type { IModulo } from "../interfaces";
import { MenuNavService } from "./menu-nav.service";
import { useMenuNavegacionStore } from "../../stores/menu.store";

export const useMenuNav = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const menu = useMenuNavegacionStore((state) => state.menu);

  const getMenuNavegacion = useCallback(async (): Promise<void> => {
    setError("");
    setLoading(true);
    try {
      const result = await MenuNavService.get_menu_navegacion();

      if (result.success) {
        useMenuNavegacionStore.getState().updateMenu(result.data as IModulo[]);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    menu,
    loading,
    error,
    getMenuNavegacion,
  };
};
