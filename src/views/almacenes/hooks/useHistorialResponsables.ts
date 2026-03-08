import { useState, useEffect, useMemo, useCallback } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { AlmacenesService } from "../service/almacenes.service";
import type { RES_ResponsableAlmacen } from "../service/almacenes.responses";

export const useHistorialResponsables = (id_almacen: number) => {
  const { notify } = useNotify();
  const [responsables, setResponsables] = useState<RES_ResponsableAlmacen[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const listar = useCallback(async () => {
    setLoading(true);
    try {
      const result =
        await AlmacenesService.get_historial_responsables(id_almacen);
      if (result.success) {
        setResponsables(result.data);
      } else {
        notify({ type: "error", content: result.message });
      }
    } catch (error) {
      notify({
        type: "error",
        content: "Error al cargar el historial de responsables",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id_almacen, notify]);

  useEffect(() => {
    listar();
  }, [listar]);

  const handleSuccess = (
    nuevo: RES_ResponsableAlmacen,
    onUpdateResponsable?: (nombre: string) => void,
  ) => {
    setResponsables((prev) => [nuevo, ...prev]);
    if (onUpdateResponsable) onUpdateResponsable(nuevo.nombre_completo);
    setShowForm(false);
  };

  const responsablesOrdenados = useMemo(() => {
    return [...responsables].sort((a, b) => {
      const diff =
        new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime();
      return diff !== 0
        ? diff
        : b.id_responsable_almacen - a.id_responsable_almacen;
    });
  }, [responsables]);

  return {
    responsables: responsablesOrdenados,
    loading,
    showForm,
    setShowForm,
    handleSuccess,
  };
};
