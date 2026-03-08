import { useState, useEffect, useMemo } from "react";
import { AlmacenesService } from "../service/almacenes.service";
import type { IMessage } from "../../../shared/enums/message";
import type { RES_ResponsableAlmacen } from "../service/almacenes.responses";

/**
 * Maneja la lista del historial de responsables de un almacén.
 */
export const useHistorialResponsables = (id_almacen: number) => {
  const [responsables, setResponsables] = useState<RES_ResponsableAlmacen[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<IMessage>({ type: "", content: "" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    listar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_almacen]);

  const listar = async () => {
    setLoading(true);
    setMessage({ type: "", content: "" });
    try {
      const result =
        await AlmacenesService.get_historial_responsables(id_almacen);
      if (result.success) {
        setResponsables(result.data);
      } else {
        setMessage({ type: "error", content: result.message });
      }
    } catch (error) {
      setMessage({
        type: "error",
        content: "Error al cargar el historial de responsables",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const agregarResponsable = (nuevo: RES_ResponsableAlmacen) => {
    setResponsables((prev) => [nuevo, ...prev]);
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
    message,
    showForm,
    setShowForm,
    agregarResponsable,
  };
};
