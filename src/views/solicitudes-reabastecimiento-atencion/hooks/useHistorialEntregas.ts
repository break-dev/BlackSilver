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
      const res = await SolicitudesAtencionService.obtenerHistorialEntregas(idSolicitud);
      if (res.success && res.data) {
        const entregasLogistica = (res.data.logistica || []).map(ent => ({
          ...ent,
          tipo_entrega: "Solicitud" as const
        }));
        
        const entregasPrestamo = (res.data.prestamo || []).map(ent => ({
          ...ent,
          tipo_entrega: "Prestamo" as const
        }));

        const todas = [...entregasLogistica, ...entregasPrestamo].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setEntregas(todas);
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
