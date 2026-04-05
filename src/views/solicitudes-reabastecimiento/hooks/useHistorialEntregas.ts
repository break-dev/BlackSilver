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
      
      const res = await ReabastecimientoService.obtenerHistorialEntregas(idSolicitud);

      if (!res.success || !res.data) {
        throw new Error(res.message || "Error al cargar historial");
      }

      const entregasSolicitud: RES_EntregaReabastecimiento[] = (
        res.data.logistica || []
      ).map((ent) => ({
        ...ent,
        tipo_entrega: "Solicitud",
        detalles: (ent.detalles || []).map((d) => ({
          ...d,
          tipo_entrega: "Solicitud",
        })),
      }));

      const entregasPrestamo: RES_EntregaReabastecimiento[] = (
        res.data.prestamo || []
      ).map((ent) => ({
        ...ent,
        id_reabastecimiento_entrega: ent.id_reabastecimiento_entrega || ent.id_entrega || 0,
        tipo_entrega: "Prestamo",
        estado:
          ent.estado === "En despacho"
            ? "Procesada"
            : ent.estado === "Entrega confirmada"
              ? "Recibida"
              : ent.estado,
        detalles: (ent.detalles || []).map((d) => ({
          ...d,
          tipo_entrega: "Prestamo",
          estado_entrega_detalle:
            d.estado_entrega_detalle === "En despacho"
              ? "Entregado"
              : d.estado_entrega_detalle === "Entrega confirmada"
                ? "Recibido"
                : d.estado_entrega_detalle,
        })),
      }));

      const todas = [...entregasSolicitud, ...entregasPrestamo].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setEntregas(todas);
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
