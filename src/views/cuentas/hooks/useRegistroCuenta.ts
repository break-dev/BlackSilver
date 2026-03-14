import { useState, useEffect } from 'react';
import { useCuentasStore } from '../service/cuentas.service';
import { CuentasRequests } from '../service/cuentas.requests';
import { useNotify } from '../../../hooks/useNotify';

export const useRegistroCuenta = (cuentaEdit: any, onClose: () => void, refresh: () => void) => {
    const { form, setForm, resetForm, roles, empleadosSinCuenta } = useCuentasStore();
    const [loading, setLoading] = useState(false);
    const { notify } = useNotify();

    useEffect(() => {
        if (cuentaEdit) {
            setForm({
                id_empleado: cuentaEdit.id_empleado,
                id_rol: cuentaEdit.id_rol,
                username: cuentaEdit.username,
                password: '' // Vacío por defecto al editar
            });
        } else {
            resetForm();
        }
    }, [cuentaEdit]);

    const handleGuardar = async () => {
        // Validaciones básicas
        if (!form.username || !form.id_rol || (!cuentaEdit && !form.password) || (!cuentaEdit && !form.id_empleado)) {
            notify({
                type: 'info',
                content: 'Por favor, completa todos los campos requeridos.'
            });
            return;
        }

        setLoading(true);
        try {
            let res;
            if (cuentaEdit) {
                res = await CuentasRequests.actualizarCuenta(cuentaEdit.id_usuario, form);
            } else {
                res = await CuentasRequests.crearCuenta(form);
            }

            if (res.success) {
                notify({
                    type: 'success',
                    content: res.message
                });
                refresh();
                onClose();
            } else {
                notify({
                    type: 'error',
                    content: res.message
                });
            }
        } catch (error: any) {
            notify({
                type: 'error',
                content: 'No se pudo comunicar con el servidor.'
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        form,
        setForm,
        loading,
        handleGuardar,
        roles,
        empleadosSinCuenta,
        isEdit: !!cuentaEdit
    };
};
