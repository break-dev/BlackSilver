import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IModulo } from "../services/menu/dtos/menu.dto";

export interface IMenuStore {
  menu: IModulo[];
  updateMenu: (menu: IModulo[]) => void;
  clearMenu: () => void;
}

// Store para renderizar el menu de navegacion en localStorage
export const MenuStore = create<IMenuStore>()(
  persist(
    (set) => ({
      menu: [],
      updateMenu: (menu) => set({ menu }),
      clearMenu: () => set({ menu: [] }),
    }),
    {
      name: "menu-storage",
    },
  ),
);
