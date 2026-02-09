import { create } from "zustand";
import type { IModulo } from "../services/menu/dtos/menu.dto";

export interface IMenuStore {
  menu: IModulo[];
  updateMenu: (menu: IModulo[]) => void;
}

// Store para renderizar el menu de navegacion
export const MenuStore = create<IMenuStore>((set) => ({
  menu: [],
  updateMenu: (menu) => set({ menu }),
}));
