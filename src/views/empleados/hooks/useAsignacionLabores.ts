import { useState, useCallback } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { EmpleadosService } from "../service/empleados.service";
import type { RES_Empleado, RES_Labor } from "../service/empleados.responses";

export const useAsignacionLabores = (onSuccess: () => void) => {
  const { notify } = useNotify();

  const [empleado, setEmpleado] = useState<RES_Empleado | null>(null);
  const [laboresDisponibles, setLaboresDisponibles] = useState<RES_Labor[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLabores, setLoadingLabores] = useState(false);

  const abrir = useCallback(async (emp: RES_Empleado) => {
    setEmpleado(emp);
    setSeleccionados([]);
    setLoadingLabores(true);
    try {
      // Cargamos solo las que NO tiene el empleado (pasando su ID como filtro al back)
      const resp = await EmpleadosService.get_labores_disponibles(emp.id_mina, emp.id_empleado);
      if (resp.success) setLaboresDisponibles(resp.data);
    } catch (err) {
      console.error(err);
      notify({ type: "error", content: "Error al cargar labores" });
    } finally {
      setLoadingLabores(false);
    }
  }, [notify]);

  const cerrar = () => {
    setEmpleado(null);
    setLaboresDisponibles([]);
    setSeleccionados([]);
  };

  const toggleSeleccion = (idLabor: number) => {
    setSeleccionados((prev) =>
      prev.includes(idLabor)
        ? prev.filter((id) => id !== idLabor)
        : [...prev, idLabor],
    );
  };

  const handleAsignar = async () => {
    if (!empleado) return;

    if (seleccionados.length === 0) {
      notify({ type: "error", content: "Selecciona al menos una labor para asignar." });
      return;
    }

    setLoading(true);
    try {
      const resp = await EmpleadosService.asignar_labores(empleado.id_empleado, {
        ids_labor: seleccionados,
      });
      if (resp.success) {
        notify({ type: "success", content: resp.message });
        cerrar();
        onSuccess();
      } else {
        notify({ type: "error", content: resp.message });
      }
    } catch (err) {
      console.error(err);
      notify({ type: "error", content: "Error inesperado" });
    } finally {
      setLoading(false);
    }
  };

  return {
    empleado,
    laboresDisponibles,
    seleccionados,
    loading,
    loadingLabores,
    opened: empleado !== null,
    abrir,
    cerrar,
    toggleSeleccion,
    handleAsignar,
  };
};
