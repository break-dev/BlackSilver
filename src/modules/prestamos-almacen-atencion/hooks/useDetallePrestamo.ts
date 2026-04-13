import { useState, useCallback, useEffect, useMemo } from "react";
import { useDisclosure } from "@mantine/hooks";
import { PrestamosAtencionService } from "../service/prestamos-atencion.service";
import { useNotify } from "../../../hooks/useNotify";
import type { RES_PrestamoDetalle } from "../../../service/responses/prestamos/prestamo";
import type { RES_PrestamoReposicion } from "../../../service/responses/prestamos/prestamo-reposicion";
import { Estado_PrestamoDetalle } from "../../../shared/enums/prestamo-almacen/prestamo";
import type { RES_PrestamoEntrega } from "../../../service/responses/prestamos/prestamo-entrega";
import type { RES_Trazabilidad } from "../../../service/responses/_generic/trazabilidad";

interface Props {
  idPrestamo: number;
  onSuccess: () => void;
}

export const useDetallePrestamo = ({ idPrestamo, onSuccess }: Props) => {
  const { notifyError, notifySuccess } = useNotify();
  const [loading, setLoading] = useState(true);
  const [detalles, setDetalles] = useState<RES_PrestamoDetalle[]>([]);
  const [entregas, setEntregas] = useState<RES_PrestamoEntrega[]>([]);

  // Modales
  const [openedTrace, { open: openTrace, close: closeTrace }] =
    useDisclosure(false);
  const [openedAprobar, { open: openAprobar, close: closeAprobar }] =
    useDisclosure(false);
  const [openedRechazo, { open: openRechazo, close: closeRechazo }] =
    useDisclosure(false);
  const [
    openedNuevaEntrega,
    { open: openNuevaEntrega, close: closeNuevaEntrega },
  ] = useDisclosure(false);
  const [openedHistorial, { open: openHistorial, close: closeHistorial }] =
    useDisclosure(false);
  const [
    openedHistorialRepos,
    { open: openHistorialRepos, close: closeHistorialRepos },
  ] = useDisclosure(false);

  const [reposiciones, setReposiciones] = useState<RES_PrestamoReposicion[]>(
    [],
  );
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingEntregas, setLoadingEntregas] = useState(false);

  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [comentarioAccion, setComentarioAccion] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [trazabilidad, setTrazabilidad] = useState<RES_Trazabilidad[]>([]);
  const [loadingTrace, setLoadingTrace] = useState(false);

  // Selección múltiple para despacho
  const [selectedItemsIds, setSelectedItemsIds] = useState<number[]>([]);

  // Selección múltiple para acciones de aprobación/rechazo (PENDIENTES)
  const [idsParaAccionMasiva, setIdsParaAccionMasiva] = useState<number[]>([]);

  const toggleSeleccionMasiva = useCallback((id: number) => {
    setIdsParaAccionMasiva((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const pendingItemsIds = useMemo(() => {
    return detalles
      .filter((d) => d.estado === Estado_PrestamoDetalle.EsperandoAprobacion)
      .map((d) => d.id_prestamo_detalle);
  }, [detalles]);

  const isAllPendingSelected = useMemo(() => {
    return (
      pendingItemsIds.length > 0 &&
      pendingItemsIds.every((id) => idsParaAccionMasiva.includes(id))
    );
  }, [pendingItemsIds, idsParaAccionMasiva]);

  const seleccionarTodoLoPendiente = useCallback(() => {
    if (isAllPendingSelected) {
      setIdsParaAccionMasiva([]);
    } else {
      setIdsParaAccionMasiva(pendingItemsIds);
    }
  }, [isAllPendingSelected, pendingItemsIds]);

  const toggleItemSelection = useCallback((id: number) => {
    setSelectedItemsIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const deselectAllItems = useCallback(() => setSelectedItemsIds([]), []);

  const cargarDatos = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      try {
        const res =
          await PrestamosAtencionService.obtenerDetallePrestamo(idPrestamo);
        if (res.success) {
          setDetalles(res.data.detalles || []);
        }
      } catch {
        notifyError("Error al cargar el detalle del préstamo");
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [idPrestamo, notifyError],
  );

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const obtenerTrazabilidad = useCallback(async (idDetalle: number) => {
    setLoadingTrace(true);
    try {
      const res = await PrestamosAtencionService.obtenerTrazabilidad(idDetalle);
      if (res.success) {
        setTrazabilidad(res.data);
      }
    } finally {
      setLoadingTrace(false);
    }
  }, []);

  const cargarReposiciones = useCallback(async () => {
    setLoadingRepos(true);
    try {
      const res =
        await PrestamosAtencionService.obtenerHistorialReposiciones(idPrestamo);
      if (res.success) {
        setReposiciones(res.data);
      }
    } catch {
      notifyError("Error al cargar el historial de reposiciones");
    } finally {
      setLoadingRepos(false);
    }
  }, [idPrestamo, notifyError]);

  const cargarEntregas = useCallback(async () => {
    setLoadingEntregas(true);
    try {
      const res =
        await PrestamosAtencionService.obtenerHistorialEntregas(idPrestamo);
      if (res.success) {
        setEntregas(res.data);
      }
    } catch {
      notifyError("Error al cargar el historial de entregas");
    } finally {
      setLoadingEntregas(false);
    }
  }, [idPrestamo, notifyError]);

  const handleCambiarEstado = useCallback(
    async (nuevoEstado: string) => {
      const ids = selectedItemId ? [selectedItemId] : idsParaAccionMasiva;
      if (ids.length === 0) return;

      setIsProcessing(true);
      try {
        const res = await PrestamosAtencionService.cambiarEstadoDetalle({
          ids_detalles: ids,
          nuevo_estado: nuevoEstado,
          comentario: comentarioAccion,
        });
        if (res.success) {
          notifySuccess(res.message || "Estado actualizado");
          setComentarioAccion("");
          setIdsParaAccionMasiva([]); // Limpiar selección masiva tras éxito
          closeAprobar();
          closeRechazo();

          // Actualización local inmediata para feedback instantáneo
          setDetalles((prev) =>
            prev.map((d) =>
              d.id_prestamo_detalle === ids[0] // or handle bulk better if needed, but for local feedback ids[0] is fine if it was a single action
                ? { ...d, estado: nuevoEstado as Estado_PrestamoDetalle }
                : d,
            ),
          );

          // Refresco silencioso en background
          cargarDatos(true);
          onSuccess?.();
        }
      } catch {
        notifyError("No se pudo actualizar el estado");
      } finally {
        setIsProcessing(false);
      }
    },
    [
      selectedItemId,
      idsParaAccionMasiva,
      comentarioAccion,
      cargarDatos,
      closeAprobar,
      closeRechazo,
      notifyError,
      notifySuccess,
      onSuccess,
    ],
  );

  const progresoGeneral = useMemo(() => {
    if (!detalles || detalles.length === 0) return 0;

    // Solo contamos ítems que no estén rechazados o anulados para el progreso real de atención
    const itemsAtendibles = detalles.filter(
      (d) =>
        !d.estado.toLowerCase().includes("rechazado") &&
        !d.estado.toLowerCase().includes("anulado") &&
        !d.estado.toLowerCase().includes("pendiente"), // Si está pendiente aún no cuenta para el progreso de 'atención'
    );

    if (itemsAtendibles.length === 0) return 0;

    let totalSolicitado = 0;
    let totalEntregado = 0;

    itemsAtendibles.forEach((d) => {
      totalSolicitado += Number(d.cantidad_solicitada_base || 0);
      totalEntregado += Number(d.cantidad_prestada_base || 0);
    });

    if (totalSolicitado <= 0) return 0;

    const calculado = Math.round((totalEntregado / totalSolicitado) * 100);
    return isNaN(calculado) ? 0 : calculado;
  }, [detalles]);

  const isItemEligibleForDelivery = useCallback((d: RES_PrestamoDetalle) => {
    const isApprovedToDispatch =
      d.estado === Estado_PrestamoDetalle.Aprobado ||
      d.estado === Estado_PrestamoDetalle.EnDespacho;

    const isFinished =
      d.estado === Estado_PrestamoDetalle.Completado ||
      d.estado === Estado_PrestamoDetalle.Cerrado ||
      d.estado === Estado_PrestamoDetalle.Rechazado;

    return isApprovedToDispatch && !isFinished;
  }, []);

  const itemsEligibleIds = useMemo(() => {
    return detalles
      .filter(isItemEligibleForDelivery)
      .map((d) => d.id_prestamo_detalle);
  }, [detalles, isItemEligibleForDelivery]);

  const isAllEligibleSelected = useMemo(() => {
    return (
      itemsEligibleIds.length > 0 &&
      itemsEligibleIds.every((id) => selectedItemsIds.includes(id))
    );
  }, [itemsEligibleIds, selectedItemsIds]);

  const hasPartialEligibleSelection = useMemo(() => {
    return (
      selectedItemsIds.length > 0 &&
      !isAllEligibleSelected &&
      itemsEligibleIds.some((id) => selectedItemsIds.includes(id))
    );
  }, [selectedItemsIds, isAllEligibleSelected, itemsEligibleIds]);

  const toggleSelectAllEligible = useCallback(() => {
    if (isAllEligibleSelected) {
      setSelectedItemsIds((prev) =>
        prev.filter((id) => !itemsEligibleIds.includes(id)),
      );
    } else {
      setSelectedItemsIds((prev) => {
        const others = prev.filter((id) => !itemsEligibleIds.includes(id));
        return [...others, ...itemsEligibleIds];
      });
    }
  }, [isAllEligibleSelected, itemsEligibleIds]);

  return {
    loading,
    detalles,
    entregas,
    progresoGeneral,
    // Modales
    openedTrace,
    openTrace,
    closeTrace,
    openedAprobar,
    openAprobar,
    closeAprobar,
    openedRechazo,
    openRechazo,
    closeRechazo,
    openedNuevaEntrega,
    openNuevaEntrega,
    closeNuevaEntrega,
    openedHistorial,
    openHistorial,
    closeHistorial,
    openedHistorialRepos,
    openHistorialRepos,
    closeHistorialRepos,
    // Estado Selección
    selectedItemId,
    setSelectedItemId,
    selectedItemName,
    setSelectedItemName,
    comentarioAccion,
    setComentarioAccion,
    isProcessing,
    trazabilidad,
    loadingTrace,
    obtenerTrazabilidad,
    handleCambiarEstado,
    // Reposiciones
    reposiciones,
    loadingRepos,
    cargarReposiciones,
    // Entregas
    loadingEntregas,
    cargarEntregas,
    selectedItemsIds,
    toggleItemSelection,
    deselectAllItems,
    cargarDatos,
    // Bulk select pending
    idsParaAccionMasiva,
    toggleSeleccionMasiva,
    isAllPendingSelected,
    seleccionarTodoLoPendiente,
    // Bulk select helpers
    isAllEligibleSelected,
    hasPartialEligibleSelection,
    toggleSelectAllEligible,
    itemsEligibleIds,
  };
};
