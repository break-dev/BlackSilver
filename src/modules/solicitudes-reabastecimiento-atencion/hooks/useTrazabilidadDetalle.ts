import { useState, useCallback, useEffect } from "react";
import { SolicitudesAtencionService } from "../service/solicitudes-atencion.service";
import type { RES_Trazabilidad } from "../../../service/responses/_generic/trazabilidad";

export const useTrazabilidadDetalle = (idDetalle: number | null) => {
  const [loading, setLoading] = useState(false);
  const [eventos, setEventos] = useState<RES_Trazabilidad[]>([]);

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
