import { useState, useCallback, useEffect } from "react";
import { SolicitudesAtencionService } from "../service/solicitudes-atencion.service";
import type { RES_EntregaReabastecimiento, RES_DetalleEntregaReabastecimiento } from "../service/solicitudes-atencion.responses";

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
          tipo_entrega: "Solicitud" as const,
          detalles: (ent.detalles || []).map((d: RES_DetalleEntregaReabastecimiento) => ({
            ...d,
            tipo_entrega: "Solicitud" as const,
            estado_entrega_detalle: d.estado === "Entregado" || d.estado === "Procesada" ? "Entregado" : d.estado,
            cantidad_recibida_total_base: Number(d.cantidad_recibida_total_base || 0),
          })),
        }));
        
        const entregasPrestamo = (res.data.prestamo || []).map(ent => ({
          ...ent,
          // Mapeamos el ID natural al ID genérico que espera el componente de recepción
          id_reabastecimiento_entrega: ent.id_prestamo_entrega || ent.id_reabastecimiento_entrega || 0,
          tipo_entrega: "Prestamo" as const,
          estado: ent.estado === "En despacho" ? "Procesada"
            : ent.estado === "Entrega confirmada" ? "Recibida"
            : ent.estado === "Recibido Parcialmente" ? "Recepcionado Parcialmente"
            : ent.estado,
          detalles: (ent.detalles || []).map((d: RES_DetalleEntregaReabastecimiento) => ({
            ...d,
            tipo_entrega: "Prestamo" as const,
            // Mapeamos los campos naturales del préstamo a los nombres genéricos
            id_entrega_detalle: d.id_entrega_detalle,
            cantidad_solicitud: Number(d.cantidad_prestamo || d.cantidad_base || 0),
            id_unidad_medida_solicitada: d.id_unidad_medida_pr || d.id_unidad_medida_solicitada,
            unidad_medida_solicitud_abv: d.unidad_medida_pr_abv || d.unidad_medida_solicitud_abv,
            contenido_por_presentacion_solicitado: Number(d.contenido_por_presentacion_pr || d.contenido_por_presentacion_solicitado || 1),
            estado_entrega_detalle: d.estado === "En despacho" ? "Entregado"
              : d.estado === "Entrega confirmada" ? "Recibido"
              : d.estado,
            cantidad_recibida_total_base: Number(d.cantidad_recibida_total_base || 0),
          })),
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
