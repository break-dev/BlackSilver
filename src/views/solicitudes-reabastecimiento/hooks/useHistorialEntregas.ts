import { useState, useCallback, useEffect } from "react";
import { ReabastecimientoService } from "../service/reabastecimiento.service";
import type { RES_EntregaReabastecimiento, RES_DetalleEntregaReabastecimiento } from "../service/reabastecimiento.responses";

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
          estado_entrega_detalle:
            d.estado === "Entregado" || d.estado === "Procesada"
              ? "Entregado"
              : d.estado,
          cantidad_recibida_total_base: Number(d.cantidad_recibida_total_base || 0),
        })),
      }));

      const entregasPrestamo: RES_EntregaReabastecimiento[] = (
        res.data.prestamo || []
      ).map((ent: RES_EntregaReabastecimiento) => ({
        ...ent,
        // Mapeamos el ID natural al ID genérico que espera el componente de recepción
        id_reabastecimiento_entrega: ent.id_prestamo_entrega || ent.id_reabastecimiento_entrega || 0,
        tipo_entrega: "Prestamo",
        estado:
          ent.estado === "En despacho"
            ? "Procesada"
            : ent.estado === "Entrega confirmada"
              ? "Recibida"
              : ent.estado,
        detalles: (ent.detalles || []).map((d: RES_DetalleEntregaReabastecimiento) => ({
          ...d,
          tipo_entrega: "Prestamo",
          // Mapeamos los campos naturales del préstamo a los nombres genéricos del front
          id_entrega_detalle: d.id_entrega_detalle,
          cantidad_solicitud: Number(d.cantidad_prestamo || d.cantidad_base || 0),
          id_unidad_medida_solicitada: d.id_unidad_medida_pr || d.id_unidad_medida_solicitada,
          unidad_medida_solicitud_abv: d.unidad_medida_pr_abv || d.unidad_medida_solicitud_abv,
          contenido_por_presentacion_solicitado: Number(d.contenido_por_presentacion_pr || d.contenido_por_presentacion_solicitado || 1),
          // Mapeo de estados
          estado_entrega_detalle:
            d.estado === "En despacho"
              ? "Entregado"
              : d.estado === "Entrega confirmada"
                ? "Recibido"
                : d.estado,
          cantidad_recibida_total_base: Number(d.cantidad_recibida_total_base || 0),
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
