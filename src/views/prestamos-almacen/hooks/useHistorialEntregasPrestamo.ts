import { useState, useEffect, useCallback } from "react";
import { PrestamosService } from "../service/prestamos.service";
import type { RES_HistorialEntregaPrestamo } from "../service/prestamos.responses";

export const useHistorialEntregasPrestamo = (idPrestamo: number) => {
  const [loading, setLoading] = useState(true);
  const [historial, setHistorial] = useState<RES_HistorialEntregaPrestamo[]>(
    [],
  );
  const [error, setError] = useState("");

  const fetchHistorial = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await PrestamosService.getHistorialEntregas(idPrestamo);
      setHistorial(data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar el historial de entregas");
    } finally {
      setLoading(false);
    }
  }, [idPrestamo]);

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
