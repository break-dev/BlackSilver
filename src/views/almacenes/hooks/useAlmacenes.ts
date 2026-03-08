import { useState, useEffect, useMemo, useCallback } from "react";
import { useNotify } from "../../../hooks/useNotify";
import type { IMessage } from "../../../shared/interfaces";
import type { RES_Almacen } from "../service/almacenes.responses";
import { AlmacenesService } from "../service/almacenes.service";

export const useAlmacenes = () => {
  const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  // Búsqueda
  const [busqueda, setBusqueda] = useState("");

  const handleChildMessage = (msg: IMessage) => {
    if (!msg.type) return;
    notify(msg);
  };

  const listar = useCallback(async () => {
    setLoading(true);
    try {
      const result = await AlmacenesService.get_almacenes();
      if (result.success) {
        setAlmacenes(result.data);
      } else {
        notify({ type: "error", content: result.message });
      }
    } catch (error) {
      notify({ type: "error", content: "Error al cargar los almacenes" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    listar();
  }, [listar]);

  const almacenesFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return almacenes.filter(
      (alm) =>
        !q ||
        alm.nombre.toLowerCase().includes(q) ||
        (alm.responsable_actual || "").toLowerCase().includes(q),
    );
  }, [almacenes, busqueda]);

  return {
    almacenes,
    loading,
    setAlmacenes,
    handleChildMessage,
    busqueda,
    setBusqueda,
    almacenesFiltrados,
  };
};
