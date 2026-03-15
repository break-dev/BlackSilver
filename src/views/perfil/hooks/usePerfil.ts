import { useEffect, useCallback } from 'react';
import { usePerfilStore } from './usePerfilStore';
import { PerfilService } from '../service/perfil.service';

export const usePerfil = () => {
    const { perfil, loading, setPerfil, setLoading } = usePerfilStore();

    const cargarPerfil = useCallback(async () => {
        setLoading(true);
        try {
            const res = await PerfilService.get_perfil();
            if (res.success) {
                setPerfil(res.data);
            }
        } catch (error) {
            console.error('Error al cargar perfil:', error);
        } finally {
            setLoading(false);
        }
    }, [setPerfil, setLoading]);

    useEffect(() => {
        if (!perfil) {
            cargarPerfil();
        }
    }, [perfil, cargarPerfil]);

    return {
        perfil,
        loading,
        refetch: cargarPerfil
    };
};
