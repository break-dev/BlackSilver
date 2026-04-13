import { useState, useCallback, useEffect, useMemo } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  Estado_SolicitudDetalle,
  Estado_SolicitudDetalleLog,
} from "../../../shared/enums/solicitud-reabastecimiento/solicitud";
import { SolicitudesAtencionService } from "../service/solicitudes-atencion.service";
import type { DetalleSolicitudExtendido } from "../service/solicitudes-atencion.responses";
import type { AxiosError } from "axios";
import { useNotify } from "../../../hooks/useNotify";

interface UseDetalleSolicitudProps {
  idSolicitud: number;
  onSuccess: () => void;
}

export const useDetalleSolicitud = ({
  idSolicitud,
  onSuccess,
}: UseDetalleSolicitudProps) => {
  const [loading, setLoading] = useState(true);
  const [detalles, setDetalles] = useState<DetalleSolicitudExtendido[]>([]);
  const [error, setError] = useState("");

  // Modal Control
  const [openedTrace, { open: openTrace, close: closeTrace }] =
    useDisclosure(false);
  const [openedRechazo, { open: openRechazo, close: closeRechazo }] =
    useDisclosure(false);
  const [openedAprobar, { open: openAprobar, close: closeAprobar }] =
    useDisclosure(false);
  const [openedEntrega, { open: openEntrega, close: closeEntrega }] =
    useDisclosure(false);
  const [openedHistorial, { open: openHistorial, close: closeHistorial }] =
    useDisclosure(false);
  const [openedPrestamo, { open: openPrestamo, close: closePrestamo }] =
    useDisclosure(false);

  // Selected Data
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [comentarioAccion, setComentarioAccion] = useState("");
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  // Batch Selection (para entrega/despacho)
  const [selectedItemsIds, setSelectedItemsIds] = useState<number[]>([]);

  // Batch Pendientes (para aprobar/rechazar masivamente)
  const [idsParaAccionMasiva, setIdsParaAccionMasiva] = useState<number[]>([]);

  const { notifySuccess } = useNotify();

  const toggleItemSelection = useCallback((id: number) => {
    setSelectedItemsIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const toggleSeleccionMasiva = useCallback((id: number) => {
    setIdsParaAccionMasiva((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const deseleccionarMasivos = useCallback(() => {
    setIdsParaAccionMasiva([]);
  }, []);

  const isAllPendingSelected = useMemo(() => {
    const pendientes = detalles.filter(
      (d) => d.estado === Estado_SolicitudDetalle.EsperandoAprobacion,
    );
    return (
      pendientes.length > 0 && idsParaAccionMasiva.length === pendientes.length
    );
  }, [detalles, idsParaAccionMasiva]);

  const seleccionarTodoLoPendiente = useCallback(() => {
    if (isAllPendingSelected) {
      setIdsParaAccionMasiva([]);
    } else {
      const pendientes = detalles.filter(
        (d) => d.estado === Estado_SolicitudDetalle.EsperandoAprobacion,
      );
      setIdsParaAccionMasiva(pendientes.map((d) => d.id_solicitud_detalle));
    }
  }, [detalles, isAllPendingSelected]);

  const eligibleForDelivery = useMemo(() => {
    return detalles.filter(
      (d) =>
        (d.estado === Estado_SolicitudDetalle.Aprobado ||
          d.estado === Estado_SolicitudDetalle.EnDespacho) &&
        d.cantidad_solicitada_base - d.cantidad_entregada_base > 0,
    );
  }, [detalles]);

  const isAllEligibleSelected = useMemo(() => {
    return (
      eligibleForDelivery.length > 0 &&
      eligibleForDelivery.every((d) =>
        selectedItemsIds.includes(d.id_solicitud_detalle),
      )
    );
  }, [eligibleForDelivery, selectedItemsIds]);

  const toggleSelectAllEligible = useCallback(() => {
    if (isAllEligibleSelected) {
      setSelectedItemsIds([]);
    } else {
      setSelectedItemsIds(
        eligibleForDelivery.map((d) => d.id_solicitud_detalle),
      );
    }
  }, [eligibleForDelivery, isAllEligibleSelected]);

  const loadData = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      try {
        const resp =
          await SolicitudesAtencionService.obtenerDetallesSolicitud(
            idSolicitud,
          );
        if (resp.success) {
          setDetalles(
            resp.data.map((d) => ({
              ...d,
              pendiente_base:
                d.cantidad_solicitada_base -
                (Number(d.cantidad_entregada_base) +
                  Number(d.cantidad_prestada_total_base)),
            })),
          );
        } else {
          setError(resp.message || "Error al obtener detalles");
        }
      } catch (err) {
        const axiosError = err as AxiosError<{ message: string }>;
        setError(axiosError.response?.data?.message || "Error de conexión");
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [idSolicitud],
  );

  useEffect(() => {
    loadData();
  }, [idSolicitud, loadData]);

  const handleAprobar = useCallback(async () => {
    const ids = selectedItemId ? [selectedItemId] : idsParaAccionMasiva;
    if (ids.length === 0) return;

    setIsProcessing(selectedItemId || -1);
    setError("");
    const motivo = comentarioAccion;
    try {
      const res = await SolicitudesAtencionService.guardarDecisionDetalle({
        ids_detalles: ids,
        nuevo_estado:
          Estado_SolicitudDetalleLog.Aprobado as unknown as Estado_SolicitudDetalle,
        comentario_decision: motivo,
      });
      if (res.success) {
        closeAprobar();
        setComentarioAccion("");
        deseleccionarMasivos();
        setDetalles((prev) =>
          prev.map((item) =>
            ids.includes(item.id_solicitud_detalle)
              ? {
                  ...item,
                  estado:
                    Estado_SolicitudDetalleLog.Aprobado as unknown as Estado_SolicitudDetalle,
                  comentario_decision: motivo,
                }
              : item,
          ),
        );
        onSuccess();
        notifySuccess(
          ids.length > 1
            ? "Ítems aprobados correctamente"
            : "Ítem aprobado correctamente",
        );
      } else {
        setError(res.message || "Error al aprobar");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Error de conexión");
    } finally {
      setIsProcessing(null);
    }
  }, [
    selectedItemId,
    idsParaAccionMasiva,
    comentarioAccion,
    closeAprobar,
    onSuccess,
    notifySuccess,
    deseleccionarMasivos,
  ]);

  const handleRechazar = useCallback(async () => {
    const ids = selectedItemId ? [selectedItemId] : idsParaAccionMasiva;
    if (ids.length === 0) return;

    setIsProcessing(selectedItemId || -1);
    setError("");
    const motivo = comentarioAccion;
    try {
      const res = await SolicitudesAtencionService.guardarDecisionDetalle({
        ids_detalles: ids,
        nuevo_estado:
          Estado_SolicitudDetalleLog.Rechazado as unknown as Estado_SolicitudDetalle,
        comentario_decision: motivo,
      });
      if (res.success) {
        closeRechazo();
        setComentarioAccion("");
        deseleccionarMasivos();
        setDetalles((prev) =>
          prev.map((item) =>
            ids.includes(item.id_solicitud_detalle)
              ? {
                  ...item,
                  estado:
                    Estado_SolicitudDetalleLog.Rechazado as unknown as Estado_SolicitudDetalle,
                  comentario_decision: motivo,
                }
              : item,
          ),
        );
        onSuccess();
        notifySuccess(
          ids.length > 1 ? "Ítems rechazados correctamente" : "Ítem rechazado",
        );
      } else {
        setError(res.message || "Error al rechazar");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Error de conexión");
    } finally {
      setIsProcessing(null);
    }
  }, [
    selectedItemId,
    idsParaAccionMasiva,
    comentarioAccion,
    closeRechazo,
    onSuccess,
    notifySuccess,
    deseleccionarMasivos,
  ]);

  const getStatusColor = (status: string) => {
    if (status === Estado_SolicitudDetalleLog.EsperandoAprobacion)
      return "blue";
    if (status === Estado_SolicitudDetalleLog.Aprobado) return "violet";
    if (status === Estado_SolicitudDetalleLog.EnDespacho) return "orange";
    if (status === Estado_SolicitudDetalleLog.NuevaEntrega) return "green";
    if (status === Estado_SolicitudDetalleLog.Completado) return "teal";
    if (status === Estado_SolicitudDetalleLog.Rechazado) return "red";
    if (status === Estado_SolicitudDetalleLog.SolicitandoPrestamo)
      return "pink";
    return "zinc";
  };

  const progresoGeneral = useMemo(() => {
    if (detalles.length === 0) return 0;
    const itemsAtendibles = detalles.filter(
      (item) => item.estado !== Estado_SolicitudDetalle.Rechazado,
    );
    if (itemsAtendibles.length === 0) return 0;
    const sumaProgreso = itemsAtendibles.reduce(
      (acc, item) => acc + Number(item.porcentaje_progreso || 0),
      0,
    );
    return Math.round(sumaProgreso / itemsAtendibles.length);
  }, [detalles]);

  const updateDetalleLocal = useCallback(
    (id: number, data: Partial<DetalleSolicitudExtendido>) => {
      setDetalles((prev) =>
        prev.map((item) =>
          item.id_solicitud_detalle === id ? { ...item, ...data } : item,
        ),
      );
    },
    [],
  );

  return {
    loading,
    detalles,
    error,
    openedTrace,
    openTrace,
    closeTrace,
    openedRechazo,
    openRechazo,
    closeRechazo,
    openedAprobar,
    openAprobar,
    closeAprobar,
    openedEntrega,
    openEntrega,
    closeEntrega,
    openedHistorial,
    openHistorial,
    closeHistorial,
    openedPrestamo,
    openPrestamo,
    closePrestamo,
    selectedItemId,
    setSelectedItemId,
    selectedItemName,
    setSelectedItemName,
    selectedItemsIds,
    setSelectedItemsIds,
    toggleItemSelection,
    idsParaAccionMasiva,
    toggleSeleccionMasiva,
    isAllPendingSelected,
    seleccionarTodoLoPendiente,
    isAllEligibleSelected,
    toggleSelectAllEligible,
    comentarioAccion,
    setComentarioAccion,
    isProcessing,
    progresoGeneral,
    handleAprobar,
    handleRechazar,
    getStatusColor,
    loadData,
    updateDetalleLocal,
  };
};
