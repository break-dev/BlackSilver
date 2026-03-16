import { useState, useCallback, useEffect } from "react";
import { SolicitudesAtencionService } from "../service/solicitudes-atencion.service";
import type { RES_EntregaReabastecimiento } from "../service/solicitudes-atencion.responses";

export const useHistorialEntregas = (idSolicitud: number) => {
  const [loading, setLoading] = useState(true);
  const [entregas, setEntregas] = useState<RES_EntregaReabastecimiento[]>([]);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res =
        await SolicitudesAtencionService.obtenerHistorialEntregas(idSolicitud);
      if (res.success) {
        setEntregas(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Error al cargar el historial de entregas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [idSolicitud]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    loading,
    entregas,
    error,
    refresh: loadData,
  };
};
