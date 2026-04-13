import { useState, useCallback, useEffect } from "react";
import { PrestamosService } from "../service/prestamos.service";
import type { RES_HistorialReposicion } from "../service/prestamos.responses";
import { useNotify } from "../../../hooks/useNotify";

export const useHistorialReposicion = (idPrestamo: number) => {
  const [loading, setLoading] = useState(false);
  const [reposiciones, setReposiciones] = useState<RES_HistorialReposicion[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const { notifyError } = useNotify();

  const fetchHistorial = useCallback(async () => {
    if (!idPrestamo) return;

    setLoading(true);
    setError(null);
    try {
      const res = await PrestamosService.getHistorialReposiciones(idPrestamo);
      if (res.success) {
        setReposiciones(res.data);
      } else {
        setError(res.message);
        notifyError(res.message);
      }
    } catch (err) {
      const msg = "Error al cargar el historial de reposiciones";
      console.error(err);
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  }, [idPrestamo, notifyError]);

  useEffect(() => {
    fetchHistorial();
  }, [fetchHistorial]);

  return {
    loading,
    reposiciones,
    error,
    refreshHistorial: fetchHistorial,
  };
};
