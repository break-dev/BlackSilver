import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCuentasStore, CuentasService } from '../service/cuentas.service';
import { useDisclosure } from '@mantine/hooks';
import type { RES_Cuenta } from '../service/cuentas.responses';

import { useNotify } from '../../../hooks/useNotify';

export const useCuentas = () => {
    const { setCuentas, setRoles, setEmpleadosSinCuenta, setLoading, loading, cuentas } = useCuentasStore();
    const [busqueda, setBusqueda] = useState('');
    const { notify } = useNotify();
    const [updatingPhoto, setUpdatingPhoto] = useState<number | null>(null);
    
    // Modales
    const [openedCreate, { open: openCreate, close: closeCreate }] = useDisclosure(false);
    
    const [selectedCuenta, setSelectedCuenta] = useState<RES_Cuenta | null>(null);

    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            const [resCuentas, resRoles, resEmpleados] = await Promise.all([
                CuentasService.fetchCuentas(),
                CuentasService.fetchRolesDisponibles(),
                CuentasService.fetchEmpleadosSinCuenta()
            ]);
            
            if (resCuentas.success) setCuentas(resCuentas.data);
            if (resRoles.success) setRoles(resRoles.data);
            if (resEmpleados.success) setEmpleadosSinCuenta(resEmpleados.data);
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

    const handleUpdatePhoto = async (idEmpleado: number, file: File) => {
        setUpdatingPhoto(idEmpleado);
        try {
            const res = await CuentasService.actualizarFoto(idEmpleado, file);
            if (res.success) {
                notify({ type: 'success', content: 'Foto actualizada correctamente' });
                // Actualización local sin recargar todo el listado
                useCuentasStore.getState().updateCuentaFoto(idEmpleado, res.data.url);
            } else {
                notify({ type: 'error', content: res.message });
            }
        } catch {
            notify({ type: 'error', content: 'Error al actualizar la foto' });
        } finally {
            setUpdatingPhoto(null);
        }
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
        handleUpdatePhoto,
        updatingPhoto,
        refresh: cargarDatos
    };
};
