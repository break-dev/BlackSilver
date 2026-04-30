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
  const [idMina, setIdMina] = useState<number | null>(null);
  const [laboresDisponibles, setLaboresDisponibles] = useState<RES_Labor[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLabores, setLoadingLabores] = useState(false);

  const cargarCatalogoLabores = useCallback(
    async (minaId: number) => {
      setLoadingLabores(true);
      try {
        const resp = await EmpleadosService.get_labores_disponibles(minaId);
        if (resp.success) {
          setLaboresDisponibles(resp.data);
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

  const abrir = useCallback(
    async (emp: RES_Empleado) => {
      setEmpleado(emp);
      setIdMina(emp.id_mina || null);

      // Pre-cargar seleccionados desde lo que ya viene en el listado
      if (emp.ids_labor_asignadas) {
        const ids = emp.ids_labor_asignadas.split(",").map(Number);
        setSeleccionados(ids);
      } else {
        setSeleccionados([]);
      }

      if (emp.id_mina) {
        cargarCatalogoLabores(emp.id_mina);
      }
    },
    [cargarCatalogoLabores],
  );

  const handleMinaChange = (val: number | null) => {
    setIdMina(val);
    setSeleccionados([]); // Al cambiar de mina, se limpian las labores
    setLaboresDisponibles([]);
    if (val) {
      cargarCatalogoLabores(val);
    }
  };

  const cerrar = () => {
    setEmpleado(null);
    setIdMina(null);
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
      const resp = await EmpleadosService.asignar_labores(empleado.id_empleado, {
        id_mina: idMina,
        ids_labor: seleccionados,
      });
      if (resp.success) {
        notify({ type: "success", content: resp.message });
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
    idMina,
    onMinaChange: handleMinaChange,
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
