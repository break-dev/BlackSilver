import { useState, useEffect } from 'react';
import { CuentasRequests } from '../service/cuentas.requests';
import type { RES_EmpresaAcceso } from '../service/cuentas.responses';
import { useNotify } from '../../../hooks/useNotify';

export const useGestionEmpresas = (id_usuario: number, refreshParent: () => void) => {
    const [asignadas, setAsignadas] = useState<RES_EmpresaAcceso[]>([]);
    const [todas, setTodas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { notify } = useNotify();

    const cargarEmpresas = async () => {
        if (!id_usuario) return;
        setLoading(true);
        try {
            const res = await CuentasRequests.fetchEmpresasUsuario(id_usuario);
            setAsignadas(res.asignadas);
            setTodas(res.todas);
        } catch (error) {
            console.error('Error cargando empresas del usuario:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarEmpresas();
    }, [id_usuario]);

    const handleVincular = async (id_empresa: number) => {
        try {
            const res = await CuentasRequests.vincularEmpresa(id_usuario, id_empresa);
            if (res.success) {
                notify({ type: 'success', content: res.message });
                cargarEmpresas();
                refreshParent();
            } else {
                notify({ type: 'error', content: res.message });
            }
        } catch (error) {
            notify({ type: 'error', content: 'Error de conexión' });
        }
    };

    const handleDesvincular = async (id_empresa: number) => {
        try {
            const res = await CuentasRequests.desvincularEmpresa(id_usuario, id_empresa);
            if (res.success) {
                notify({ type: 'success', content: res.message });
                cargarEmpresas();
                refreshParent();
            } else {
                notify({ type: 'error', content: res.message });
            }
        } catch (error) {
            notify({ type: 'error', content: 'Error de conexión' });
        }
    };

    return {
        asignadas,
        todas,
        loading,
        handleVincular,
        handleDesvincular
    };
};
