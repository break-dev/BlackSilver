import { useState, useCallback, useEffect } from "react";
import { ReabastecimientoService } from "../service/reabastecimiento.service";
import type {
  RES_SolicitudEntrega,
  RES_SolicitudEntregaDetalle,
} from "../../../service/responses/solicitudes-reabastecimiento/solicitud-entrega";
import type {
  RES_PrestamoEntrega,
  RES_PrestamoEntregaDetalle,
} from "../../../service/responses/prestamos/prestamo-entrega";
import {
  Estado_SolicitudEntrega,
  Estado_SolicitudEntregaDetalle,
} from "../../../shared/enums/solicitud-reabastecimiento/solicitud-entrega";
import { Estado_PrestamoEntregaDetalle } from "../../../shared/enums/prestamo-almacen/prestamo-entrega";

export type HistorialEntregaDetalleItem = (
  | (RES_SolicitudEntregaDetalle & { tipo_entrega: "Solicitud" })
  | (RES_PrestamoEntregaDetalle & { tipo_entrega: "Prestamo" })
) & {
  estado_entrega_detalle: string;
  id_entrega_detalle: number;
  cantidad_solicitud: number;
  id_unidad_medida_sol: number;
  unidad_medida_sol_abv: string;
  contenido_por_presentacion_sol: number;
  cantidad_recibida_total_base: number;
  id_reabastecimiento_entrega: number;
  cantidad_lote: number;
  estado: Estado_SolicitudEntregaDetalle | Estado_PrestamoEntregaDetalle;
};

export type HistorialEntregaItem = (
  | Omit<RES_SolicitudEntrega, "detalles" | "estado">
  | Omit<RES_PrestamoEntrega, "detalles" | "estado">
) & {
  tipo_entrega: "Solicitud" | "Prestamo";
  id_reabastecimiento_entrega: number;
  correlativo_prestamo?: string; // Solo para Préstamo
  estado: Estado_SolicitudEntrega | string;
  detalles: HistorialEntregaDetalleItem[];
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
        detalles: (ent.detalles || []).map(
          (d: RES_SolicitudEntregaDetalle) => ({
            ...d,
            tipo_entrega: "Solicitud" as const,
            estado_entrega_detalle: d.estado,
            id_entrega_detalle: d.id_entrega_detalle,
            cantidad_solicitud: d.cantidad_solicitud,
            id_unidad_medida_sol: d.id_unidad_medida_sol,
            unidad_medida_sol_abv: d.unidad_medida_sol_abv,
            contenido_por_presentacion_sol: d.contenido_por_presentacion_sol,
            cantidad_recibida_total_base: Number(
              d.cantidad_recibida_total_base || 0,
            ),
            estado: d.estado,
          }),
        ),
      }));

      const entregasPrestamo = (res.data.prestamo || []).map(
        (ent: RES_PrestamoEntrega) => ({
          ...ent,
          // Mapeamos el ID natural al ID genérico que espera el componente de recepción
          id_reabastecimiento_entrega: ent.id_prestamo_entrega,
          tipo_entrega: "Prestamo" as const,
          correlativo_prestamo: ent.correlativo, // Usamos su propio correlativo como el del préstamo
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
              cantidad_recibida_total_base: d.cantidad_total_recepcionada_base,
              id_reabastecimiento_entrega: ent.id_prestamo_entrega,
              cantidad_lote: d.cantidad_lot,
              estado: d.estado,
            }),
          ),
        }),
      );

      const todas = [...entregasSolicitud, ...entregasPrestamo].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setEntregas(todas as HistorialEntregaItem[]);
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
