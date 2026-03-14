import { useState, useEffect, useMemo } from 'react';
import { useCuentasStore } from '../service/cuentas.service';
import { CuentasRequests } from '../service/cuentas.requests';
import { useDisclosure } from '@mantine/hooks';

export const useCuentas = () => {
    const { setCuentas, setRoles, setEmpleadosSinCuenta, setLoading, loading, cuentas } = useCuentasStore();
    const [busqueda, setBusqueda] = useState('');
    
    // Modales
    const [openedCreate, { open: openCreate, close: closeCreate }] = useDisclosure(false);
    const [openedEmpresas, { open: openEmpresas, close: closeEmpresas }] = useDisclosure(false);
    
    const [selectedCuenta, setSelectedCuenta] = useState<any>(null);

    const cargarDatos = async () => {
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
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const cuentasFiltradas = useMemo(() => {
        return cuentas.filter(c => 
            c.username.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.nombre_empleado.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.apellido_empleado.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.nombre_rol.toLowerCase().includes(busqueda.toLowerCase())
        );
    }, [cuentas, busqueda]);

    const handleOpenEmpresas = (cuenta: any) => {
        setSelectedCuenta(cuenta);
        openEmpresas();
    };

    const handleOpenEdit = (cuenta: any) => {
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
        openedEmpresas,
        closeEmpresas,
        selectedCuenta,
        setSelectedCuenta,
        handleOpenEmpresas,
        handleOpenEdit,
        refresh: cargarDatos
    };
};
