import { useState, useEffect } from "react";
import { useCuentasStore } from "../service/cuentas.service";
import { CuentasRequests } from "../service/cuentas.requests";
import { useNotify } from "../../../hooks/useNotify";
import type { RES_Cuenta } from "../service/cuentas.responses";

export const useRegistroCuenta = (
  cuentaEdit: RES_Cuenta | null,
  onClose: () => void,
  refresh: () => void,
) => {
  const { form, setForm, resetForm, roles, empleadosSinCuenta } =
    useCuentasStore();
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    if (cuentaEdit) {
      setForm({
        id_empleado: cuentaEdit.id_empleado,
        id_rol: cuentaEdit.id_rol,
        username: cuentaEdit.username,
        password: "", // Vacío por defecto al editar
      });
    } else {
      resetForm();
    }
  }, [cuentaEdit, resetForm, setForm]);

  const handleGuardar = async () => {
    // Validaciones básicas
    if (
      !form.username ||
      !form.id_rol ||
      (!cuentaEdit && !form.password) ||
      (!cuentaEdit && !form.id_empleado)
    ) {
      notify({
        type: "info",
        content: "Por favor, completa todos los campos requeridos.",
      });
      return;
    }

    setLoading(true);
    try {
      let res;
      if (cuentaEdit) {
        res = await CuentasRequests.actualizarCuenta(cuentaEdit.id_usuario, {
          id_rol: form.id_rol,
          username: form.username,
          password: form.password,
        });
      } else {
        res = await CuentasRequests.crearCuenta({
          id_rol: form.id_rol,
          id_empleado: form.id_empleado,
          username: form.username,
          password: form.password as string,
        });
      }

      if (res.success) {
        notify({
          type: "success",
          content: res.message,
        });
        refresh();
        onClose();
      } else {
        notify({
          type: "error",
          content: res.message,
        });
      }
    } catch {
      notify({
        type: "error",
        content: "No se pudo comunicar con el servidor.",
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
    isEdit: !!cuentaEdit,
  };
};
