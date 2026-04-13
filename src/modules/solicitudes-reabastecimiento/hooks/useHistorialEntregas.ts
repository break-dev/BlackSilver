import { useState, useCallback, useEffect } from "react";
import { ReabastecimientoService } from "../service/reabastecimiento.service";
import type { RES_SolicitudEntrega } from "../../../service/responses/solicitudes-reabastecimiento/solicitud-entrega";
import type {
  RES_PrestamoEntrega,
  RES_PrestamoEntregaDetalle,
} from "../../../service/responses/prestamos/prestamo-entrega";

export type HistorialEntregaItem = (
  | RES_SolicitudEntrega
  | RES_PrestamoEntrega
) & {
  tipo_entrega: "Solicitud" | "Prestamo";
  id_reabastecimiento_entrega: number;
};

export const useHistorialEntregas = (idSolicitud: number) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entregas, setEntregas] = useState<HistorialEntregaItem[]>([]);

  const loadHistorial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res =
        await ReabastecimientoService.obtenerHistorialEntregas(idSolicitud);

      if (!res.success || !res.data) {
        throw new Error(res.message || "Error al cargar historial");
      }

      const entregasSolicitud = (res.data.logistica || []).map((ent) => ({
        ...ent,
        tipo_entrega: "Solicitud" as const,
        detalles: (ent.detalles || []).map((d) => ({
          ...d,
          tipo_entrega: "Solicitud" as const,
          estado_entrega_detalle: d.estado,
          cantidad_recibida_total_base: Number(
            d.cantidad_recibida_total_base || 0,
          ),
        })),
      })) as HistorialEntregaItem[];

      const entregasPrestamo = (res.data.prestamo || []).map(
        (ent: RES_PrestamoEntrega) =>
          ({
            ...ent,
            // Mapeamos el ID natural al ID genérico que espera el componente de recepción
            id_reabastecimiento_entrega: ent.id_prestamo_entrega,
            tipo_entrega: "Prestamo" as const,
            estado: ent.estado,
            detalles: (ent.detalles || []).map(
              (d: RES_PrestamoEntregaDetalle) => ({
                ...d,
                tipo_entrega: "Prestamo" as const,
                // Mapeamos los campos naturales del préstamo a los nombres genéricos del front
                id_entrega_detalle: d.id_entrega_detalle,
                cantidad_solicitud: d.cantidad_prestamo,
                id_unidad_medida_sol: d.id_unidad_medida_pr,
                unidad_medida_sol_abv: d.unidad_medida_pr_abv,
                contenido_por_presentacion_sol: d.contenido_por_presentacion_pr,
                // Mapeo de estados
                estado_entrega_detalle: d.estado,
                cantidad_recibida_total_base:
                  d.cantidad_total_recepcionada_base,
              }),
            ),
          }) as HistorialEntregaItem,
      );

      const todas = [...entregasSolicitud, ...entregasPrestamo].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
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
