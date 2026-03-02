import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IModulo } from "../services/menu-navegacion/dtos/responses";

export interface IMenuNavegacionStore {
  menu: IModulo[];
  updateMenu: (menu: IModulo[]) => void;
  clearMenu: () => void;
}

// Store para el menu de navegacion con persistencia
export const useMenuNavegacionStore = create<IMenuNavegacionStore>()(
  persist(
    (set) => ({
      menu: [],
      updateMenu: (menu) => set({ menu }),
      clearMenu: () => set({ menu: [] }),
    }),
    {
      name: "blacksilver-menu", // nombre en localStorage
    },
  ),
);
