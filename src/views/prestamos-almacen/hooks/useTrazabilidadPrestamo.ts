import { useState } from "react";
import { PrestamosService } from "../service/prestamos.service";
import type { RES_Trazabilidad } from "../service/prestamos.responses";
import { useNotify } from "../../../hooks/useNotify";

export const useTrazabilidadPrestamo = () => {
  const { notifyError } = useNotify();
  const [logs, setLogs] = useState<RES_Trazabilidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);

  const fetchTrazabilidad = async (idDetalle: number) => {
    setLoading(true);
    setOpened(true);
    try {
      const data = await PrestamosService.getTrazabilidadDetalle(idDetalle);
      setLogs(
        data.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
    } catch {
      notifyError("No se pudo obtener la trazabilidad");
    } finally {
      setLoading(false);
    }
  };

  const closeTrazabilidad = () => {
    setOpened(false);
    setLogs([]);
  };

  return {
    logs,
    loading,
    opened,
    fetchTrazabilidad,
    closeTrazabilidad,
  };
};
