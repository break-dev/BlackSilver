import type { RES_Cuenta, RES_EmpleadoDisponible, RES_RolDisponible, RES_EmpresaGestion } from "./cuentas.responses";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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

    crearCuenta: async (data: any) => {
        const res = await fetch(`${API_URL}/cuentas`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await res.json();
    },

    actualizarCuenta: async (id_usuario: number, data: any) => {
        const res = await fetch(`${API_URL}/cuentas/${id_usuario}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await res.json();
    },

    fetchEmpresasUsuario: async (id_usuario: number): Promise<RES_EmpresaGestion> => {
        const res = await fetch(`${API_URL}/cuentas/${id_usuario}/empresas`, {
            headers: { 'Accept': 'application/json' }
        });
        return await res.json();
    },

    vincularEmpresa: async (id_usuario: number, id_empresa: number) => {
        const res = await fetch(`${API_URL}/cuentas/vincular-empresa`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ id_usuario, id_empresa })
        });
        return await res.json();
    },

    desvincularEmpresa: async (id_usuario: number, id_empresa: number) => {
        const res = await fetch(`${API_URL}/cuentas/desvincular-empresa`, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ id_usuario, id_empresa })
        });
        return await res.json();
    }
};
