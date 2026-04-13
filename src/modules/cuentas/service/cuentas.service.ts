import { create } from "zustand";
import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type {
  RES_Cuenta,
  RES_EmpleadoDisponible,
  RES_RolDisponible,
} from "./cuentas.responses";
import type { REQ_CrearCuenta, REQ_ActualizarCuenta } from "./cuentas.requests";

const path = "/cuentas";

// --- API Service ---
export const CuentasService = {
  fetchCuentas: async () => {
    const res = await api.get<IRespuesta<RES_Cuenta[]>>(`${path}`);
    return res.data;
  },

  fetchEmpleadosSinCuenta: async () => {
    const res = await api.get<IRespuesta<RES_EmpleadoDisponible[]>>(
      `${path}/empleados-disponibles`,
    );
    return res.data;
  },

  fetchRolesDisponibles: async () => {
    const res = await api.get<IRespuesta<RES_RolDisponible[]>>(`${path}/roles`);
    return res.data;
  },

  crearCuenta: async (dto: REQ_CrearCuenta) => {
    const res = await api.post<IRespuesta<RES_Cuenta>>(`${path}`, dto);
    return res.data;
  },

  actualizarCuenta: async (id_usuario: number, dto: REQ_ActualizarCuenta) => {
    const res = await api.put<IRespuesta<null>>(`${path}/${id_usuario}`, dto);
    return res.data;
  },
};

// --- Zustand Store (Form & State) ---
interface CuentasState {
  cuentas: RES_Cuenta[];
  empleadosSinCuenta: RES_EmpleadoDisponible[];
  roles: RES_RolDisponible[];
  loading: boolean;

  // Formulario Registro/Edición
  form: {
    id_empleado: number;
    id_rol: number;
    username: string;
    password?: string;
  };

  setCuentas: (cuentas: RES_Cuenta[]) => void;
  setEmpleadosSinCuenta: (empleados: RES_EmpleadoDisponible[]) => void;
  setRoles: (roles: RES_RolDisponible[]) => void;
  setLoading: (val: boolean) => void;
  setForm: (form: Partial<CuentasState["form"]>) => void;
  resetForm: () => void;
}

export const useCuentasStore = create<CuentasState>((set) => ({
  cuentas: [],
  empleadosSinCuenta: [],
  roles: [],
  loading: false,

  form: {
    id_empleado: 0,
    id_rol: 0,
    username: "",
    password: "",
  },

  setCuentas: (cuentas) => set({ cuentas }),
  setEmpleadosSinCuenta: (empleadosSinCuenta) => set({ empleadosSinCuenta }),
  setRoles: (roles) => set({ roles }),
  setLoading: (loading) => set({ loading }),
  setForm: (form) => set((state) => ({ form: { ...state.form, ...form } })),
  resetForm: () =>
    set({
      form: {
        id_empleado: 0,
        id_rol: 0,
        username: "",
        password: "",
      },
    }),
}));
