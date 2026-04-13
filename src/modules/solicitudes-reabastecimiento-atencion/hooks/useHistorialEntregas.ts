import { useState, useCallback, useEffect } from "react";
import { SolicitudesAtencionService } from "../service/solicitudes-atencion.service";
import type {
  RES_SolicitudEntrega,
  RES_SolicitudEntregaDetalle,
} from "../../../service/responses/solicitudes-reabastecimiento/solicitud-entrega";
import type {
  RES_PrestamoEntrega,
  RES_PrestamoEntregaDetalle,
} from "../../../service/responses/prestamos/prestamo-entrega";
import {
  Estado_PrestamoEntrega,
  Estado_PrestamoEntregaDetalle,
} from "../../../shared/enums/prestamo-almacen/prestamo-entrega";
import {
  Estado_SolicitudEntrega,
  Estado_SolicitudEntregaDetalle,
} from "../../../shared/enums/solicitud-reabastecimiento/solicitud-entrega";

export interface RES_SolicitudEntregaCombinada extends Omit<
  RES_SolicitudEntrega,
  "detalles" | "estado"
> {
  tipo_entrega: "Solicitud" | "Prestamo";
  estado: Estado_SolicitudEntrega | string;
  detalles: RES_SolicitudEntregaDetalleCombinada[];
}

export interface RES_SolicitudEntregaDetalleCombinada extends Omit<
  RES_SolicitudEntregaDetalle,
  "estado"
> {
  tipo_entrega: "Solicitud" | "Prestamo";
  estado_entrega_detalle: string;
  estado: Estado_SolicitudEntregaDetalle | Estado_PrestamoEntregaDetalle;
}

export const useHistorialEntregas = (idSolicitud: number) => {
  const [loading, setLoading] = useState(true);
  const [entregas, setEntregas] = useState<RES_SolicitudEntregaCombinada[]>([]);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res =
        await SolicitudesAtencionService.obtenerHistorialEntregas(idSolicitud);
      if (res.success && res.data) {
        const entregasLogistica = (res.data.logistica || []).map(
          (ent: RES_SolicitudEntrega) => ({
            ...ent,
            tipo_entrega: "Solicitud" as const,
            detalles: (ent.detalles || []).map(
              (d: RES_SolicitudEntregaDetalle) => ({
                ...d,
                tipo_entrega: "Solicitud" as const,
                estado_entrega_detalle: d.estado,
                cantidad_recibida_total_base: Number(
                  d.cantidad_recibida_total_base || 0,
                ),
              }),
            ),
          }),
        );

        const entregasPrestamo = (res.data.prestamo || []).map(
          (ent: RES_PrestamoEntrega) => ({
            ...ent,
            id_reabastecimiento_entrega: ent.id_prestamo_entrega,
            tipo_entrega: "Prestamo" as const,
            estado:
              ent.estado === Estado_PrestamoEntrega.EnDespacho
                ? "Procesada"
                : ent.estado === Estado_PrestamoEntrega.RecepcionCompleta
                  ? "Recibida"
                  : ent.estado ===
                      Estado_PrestamoEntrega.RecepcionadoParcialmente
                    ? "Recepcionado Parcialmente"
                    : ent.estado,
            detalles: (ent.detalles || []).map(
              (d: RES_PrestamoEntregaDetalle) => ({
                ...d,
                tipo_entrega: "Prestamo" as const,
                id_reabastecimiento_entrega: ent.id_prestamo_entrega,
                id_entrega_detalle: d.id_entrega_detalle,
                id_unidad_medida_lot: d.id_unidad_medida_lot,
                cantidad_lote: d.cantidad_lot,
                id_unidad_medida_sol: d.id_unidad_medida_pr,
                unidad_medida_sol_abv: d.unidad_medida_pr_abv,
                contenido_por_presentacion_sol: d.contenido_por_presentacion_pr,
                cantidad_solicitud: d.cantidad_prestamo,
                estado_entrega_detalle: d.estado,
                cantidad_recibida_total_base: Number(
                  d.cantidad_total_recepcionada_base || 0,
                ),
              }),
            ),
          }),
        );

        const todas = [...entregasLogistica, ...entregasPrestamo].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
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
