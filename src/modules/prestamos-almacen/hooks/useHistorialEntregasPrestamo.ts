import { useState, useCallback, useEffect } from "react";
import { PrestamosService } from "../service/prestamos.service";
import { useNotify } from "../../../hooks/useNotify";
import type { RES_PrestamoEntrega } from "../../../service/responses/prestamos/prestamo-entrega";

export const useHistorialEntregasPrestamo = (idPrestamo: number) => {
  const [loading, setLoading] = useState(true);
  const [historial, setHistorial] = useState<RES_PrestamoEntrega[]>(
    [],
  );
  const [error, setError] = useState("");
  const { notifyError } = useNotify();

  const fetchHistorial = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await PrestamosService.getHistorialEntregas(idPrestamo);
      setHistorial(data);
    } catch (err) {
      const msg = "Error al cargar el historial de entregas";
      console.error(err);
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  }, [idPrestamo, notifyError]);

  useEffect(() => {
    if (idPrestamo) {
      fetchHistorial();
    }
  }, [idPrestamo, fetchHistorial]);

  return {
    loading,
    historial,
    error,
    reload: fetchHistorial,
  };
};
