import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCuentasStore } from '../service/cuentas.service';
import { CuentasRequests } from '../service/cuentas.requests';
import { useDisclosure } from '@mantine/hooks';
import type { RES_Cuenta } from '../service/cuentas.responses';

export const useCuentas = () => {
    const { setCuentas, setRoles, setEmpleadosSinCuenta, setLoading, loading, cuentas } = useCuentasStore();
    const [busqueda, setBusqueda] = useState('');
    
    // Modales
    const [openedCreate, { open: openCreate, close: closeCreate }] = useDisclosure(false);
    
    const [selectedCuenta, setSelectedCuenta] = useState<RES_Cuenta | null>(null);

    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            const [resCuentas, resRoles, resEmpleados] = await Promise.all([
                CuentasRequests.fetchCuentas(),
                CuentasRequests.fetchRolesDisponibles(),
                CuentasRequests.fetchEmpleadosSinCuenta()
            ]);
            setCuentas(resCuentas);
            setRoles(resRoles);
            setEmpleadosSinCuenta(resEmpleados);
        } catch (error) {
            console.error('Error cargando datos de cuentas:', error);
        } finally {
            setLoading(false);
        }
    }, [setCuentas, setRoles, setEmpleadosSinCuenta, setLoading]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const cuentasFiltradas = useMemo(() => {
        return cuentas.filter(c => 
            c.username.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.nombre_empleado.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.apellido_empleado.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.nombre_rol.toLowerCase().includes(busqueda.toLowerCase())
        );
    }, [cuentas, busqueda]);

    const handleOpenEdit = (cuenta: RES_Cuenta) => {
        setSelectedCuenta(cuenta);
        openCreate();
    };

    return {
        cuentasFiltradas,
        loading,
        busqueda,
        setBusqueda,
        openedCreate,
        openCreate,
        closeCreate,
        selectedCuenta,
        setSelectedCuenta,
        handleOpenEdit,
        refresh: cargarDatos
    };
};
