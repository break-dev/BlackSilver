import { useState, useCallback, useEffect } from "react";
import { ReabastecimientoService } from "../service/reabastecimiento.service";
import type { RES_EntregaReabastecimiento } from "../service/reabastecimiento.responses";

export const useHistorialEntregas = (idSolicitud: number) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entregas, setEntregas] = useState<RES_EntregaReabastecimiento[]>([]);

  const loadHistorial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ReabastecimientoService.obtenerHistorialEntregas(
        idSolicitud,
      );
      setEntregas(data.data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al cargar historial");
      }
    } finally {
      setLoading(false);
    }
  }, [idSolicitud]);

  useEffect(() => {
    if (idSolicitud > 0) {
      loadHistorial();
    }
  }, [idSolicitud, loadHistorial]);

  return {
    loading,
    error,
    entregas,
    reload: loadHistorial,
  };
};
