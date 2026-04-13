import { useState, useCallback } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { EmpleadosService } from "../service/empleados.service";
import type {
  RES_Empleado,
  RES_Labor,
  RES_LaborEmpleado,
} from "../service/empleados.responses";

export const useAsignacionLabores = (onSuccess: () => void) => {
  const { notify } = useNotify();

  const [empleado, setEmpleado] = useState<RES_Empleado | null>(null);
  const [laboresDisponibles, setLaboresDisponibles] = useState<RES_Labor[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLabores, setLoadingLabores] = useState(false);

  const abrir = useCallback(
    async (emp: RES_Empleado) => {
      setEmpleado(emp);
      setSeleccionados([]);
      setLoadingLabores(true);
      try {
        // 1. Obtener TODAS las labores activas de la mina (sin filtrar por empleado para ver el panorama completo)
        const respDisponibles = await EmpleadosService.get_labores_disponibles(
          emp.id_mina,
        );

        // 2. Obtener las labores que YA TIENE el empleado para marcarlas
        const respActuales = await EmpleadosService.get_labores_empleado(
          emp.id_empleado,
        );

        if (respDisponibles.success) {
          setLaboresDisponibles(respDisponibles.data);
        }

        if (respActuales.success) {
          setSeleccionados(
            respActuales.data.map((l: RES_LaborEmpleado) => l.id_labor),
          );
        }
      } catch (err) {
        console.error(err);
        notify({ type: "error", content: "Error al cargar labores" });
      } finally {
        setLoadingLabores(false);
      }
    },
    [notify],
  );

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

    setLoading(true);
    try {
      // Sincronizamos: lo que está seleccionado es lo que queda en la BD
      const resp = await EmpleadosService.asignar_labores(
        empleado.id_empleado,
        {
          ids_labor: seleccionados,
        },
      );
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
