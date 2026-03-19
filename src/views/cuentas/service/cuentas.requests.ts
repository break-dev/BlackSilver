import type {
  RES_Cuenta,
  RES_EmpleadoDisponible,
  RES_RolDisponible,
  REQ_CrearCuenta,
  REQ_ActualizarCuenta,
} from "./cuentas.responses";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const CuentasRequests = {
  fetchCuentas: async (): Promise<RES_Cuenta[]> => {
    const res = await fetch(`${API_URL}/cuentas`);
    return await res.json();
  },

  fetchEmpleadosSinCuenta: async (): Promise<RES_EmpleadoDisponible[]> => {
    const res = await fetch(`${API_URL}/cuentas/empleados-disponibles`);
    return await res.json();
  },

  fetchRolesDisponibles: async (): Promise<RES_RolDisponible[]> => {
    const res = await fetch(`${API_URL}/cuentas/roles`);
    return await res.json();
  },

  crearCuenta: async (data: REQ_CrearCuenta) => {
    const res = await fetch(`${API_URL}/cuentas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  actualizarCuenta: async (id_usuario: number, data: REQ_ActualizarCuenta) => {
    const res = await fetch(`${API_URL}/cuentas/${id_usuario}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  },
};
