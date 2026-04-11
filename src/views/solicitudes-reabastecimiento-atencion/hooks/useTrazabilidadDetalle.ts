import { useState, useCallback, useEffect } from "react";
import { SolicitudesAtencionService } from "../service/solicitudes-atencion.service";
import type { RES_DetalleLog } from "../service/solicitudes-atencion.responses";

export const useTrazabilidadDetalle = (idDetalle: number | null) => {
  const [loading, setLoading] = useState(false);
  const [eventos, setEventos] = useState<RES_DetalleLog[]>([]);

  const loadData = useCallback(async () => {
    if (!idDetalle) return;
    setLoading(true);
    try {
      const res =
        await SolicitudesAtencionService.obtenerTrazabilidad(idDetalle);
      if (res.success) {
        setEventos(res.data);
      } else {
        setEventos([]);
      }
    } catch (err) {
      setEventos([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [idDetalle]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    loading,
    eventos,
    refresh: loadData,
  };
};
