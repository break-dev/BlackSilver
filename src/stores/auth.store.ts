import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  RES_Login,
  RES_LoginUsuario,
} from "../services/usuarios/dtos/usuario.dto";

export interface IAuthStore {
  token: string;
  usuario: RES_LoginUsuario | null;
  isAuthenticated: boolean;
  updateAuth: (auth: RES_Login) => void;
  clearAuth: () => void;
}

// Store para conservar la informacion de la sesion en localStorage
export const AuthStore = create<IAuthStore>()(
  persist(
    (set) => ({
      token: "",
      usuario: null,
      isAuthenticated: false,

      updateAuth: (auth: RES_Login) =>
        set({
          token: auth.token,
          usuario: auth.usuario,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          token: "",
          usuario: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "blacksilver-auth",
    },
  ),
);
