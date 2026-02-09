import { create } from "zustand";
import type { RES_Login } from "../services/usuarios/dtos/usuario.dto";

export interface IAuthStore extends RES_Login {
  updateAuth: (auth: RES_Login) => void;
}

// Store para conservar la informacion de la sesion
export const AuthStore = create<IAuthStore>((set) => ({
  token: "",
  nombre: "",
  apellido: "",
  dni: "",
  ruc: "",
  carnet_extranjeria: "",
  pasaporte: "",
  fecha_nacimiento: new Date(),
  path_foto: "",

  updateAuth: (auth: RES_Login) => set(auth),
}));
