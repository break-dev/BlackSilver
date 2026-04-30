import { useState, useCallback } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { EmpleadosService } from "../service/empleados.service";
import type {
  RES_Empleado,
  RES_Labor,
} from "../service/empleados.responses";

export const useAsignacionLabores = (
  onUpdateLocal: (editado: RES_Empleado) => void,
) => {
  const { notify } = useNotify();

  const [empleado, setEmpleado] = useState<RES_Empleado | null>(null);
  const [laboresDisponibles, setLaboresDisponibles] = useState<RES_Labor[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLabores, setLoadingLabores] = useState(false);

  const abrir = useCallback(
    async (emp: RES_Empleado) => {
      setEmpleado(emp);
      
      // 1. Pre-cargar seleccionados desde lo que ya viene en el listado (REUTILIZACIÓN)
      if (emp.ids_labor_asignadas) {
        const ids = emp.ids_labor_asignadas.split(",").map(Number);
        setSeleccionados(ids);
      } else {
        setSeleccionados([]);
      }

      setLoadingLabores(true);
      try {
        // 2. Solo necesitamos las labores disponibles de la mina
        const respDisponibles = await EmpleadosService.get_labores_disponibles(
          emp.id_mina,
        );

        if (respDisponibles.success) {
          setLaboresDisponibles(respDisponibles.data);
        }
      } catch (err) {
        console.error(err);
        notify({ type: "error", content: "Error al cargar catálogo de labores" });
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
      const resp = await EmpleadosService.asignar_labores(
        empleado.id_empleado,
        {
          ids_labor: seleccionados,
        },
      );
      if (resp.success) {
        notify({ type: "success", content: resp.message });
        // ACTUALIZACIÓN QUIRÚRGICA: Usamos la respuesta del API (empleado actualizado)
        onUpdateLocal(resp.data);
        cerrar();
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
