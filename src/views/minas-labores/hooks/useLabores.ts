import { useState, useEffect, useMemo, useCallback } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useNotify } from "../../../hooks/useNotify";
import { MinasService } from "../service/minas.service";
import type { RES_Labor } from "../service/minas.responses";

interface Props {
  idMina: number;
}

export const useLabores = ({ idMina }: Props) => {
  const { notify } = useNotify();

  const [labores, setLabores] = useState<RES_Labor[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await MinasService.getLabores(idMina);
      if (res.success) {
        setLabores(res.data);
      } else {
        notify({ type: "error", content: res.message });
      }
    } catch {
      notify({ type: "error", content: "Error al cargar las labores" });
    } finally {
      setLoading(false);
    }
  }, [idMina, notify]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const laboresFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return labores;
    return labores.filter(
      (l) =>
        (l.nombre?.toLowerCase()?.includes(q) ?? false) ||
        (l.correlativo?.toLowerCase()?.includes(q) ?? false) ||
        (l.empresa?.toLowerCase()?.includes(q) ?? false) ||
        (l.veta?.toLowerCase()?.includes(q) ?? false) ||
        (l.nivel?.toLowerCase()?.includes(q) ?? false),
    );
  }, [labores, busqueda]);

  const handleLaborCreada = (nueva: RES_Labor) => {
    setLabores((prev) => [nueva, ...prev]);
    closeCreate();
    notify({ type: "success", content: "Labor creada correctamente" });
  };

  const handleLaborFinalizada = (actualizada: RES_Labor) => {
    setLabores((prev) =>
      prev.map((l) => (l.id_labor === actualizada.id_labor ? actualizada : l))
    );
  };

  return {
    laboresFiltradas,
    loading,
    busqueda,
    setBusqueda,
    openedCreate,
    openCreate,
    closeCreate,
    handleLaborCreada,
    handleLaborFinalizada,
  };
};
