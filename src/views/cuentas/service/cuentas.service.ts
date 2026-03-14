import { create } from 'zustand';
import type { RES_Cuenta, RES_EmpleadoDisponible, RES_RolDisponible } from './cuentas.responses';

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
    setForm: (form: Partial<CuentasState['form']>) => void;
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
        username: '',
        password: ''
    },

    setCuentas: (cuentas) => set({ cuentas }),
    setEmpleadosSinCuenta: (empleadosSinCuenta) => set({ empleadosSinCuenta }),
    setRoles: (roles) => set({ roles }),
    setLoading: (loading) => set({ loading }),
    setForm: (form) => set((state) => ({ form: { ...state.form, ...form } })),
    resetForm: () => set({ 
        form: { 
            id_empleado: 0, 
            id_rol: 0, 
            username: '', 
            password: '' 
        } 
    })
}));
