import { useState, useCallback, useEffect, useMemo } from "react";
import { useDisclosure } from "@mantine/hooks";
import { PrestamosAtencionService } from "../service/prestamos-atencion.service";
import type { 
  RES_DetallePrestamo, 
  RES_EntregaPrestamo,
  RES_TrazabilidadPrestamo
} from "../service/prestamos-atencion.responses";
import { useNotify } from "../../../hooks/useNotify";

interface Props {
  idPrestamo: number;
  onSuccess: () => void;
}

export const useDetallePrestamo = ({ idPrestamo, onSuccess }: Props) => {
  const { notifyError, notifySuccess } = useNotify();
  const [loading, setLoading] = useState(true);
  const [detalles, setDetalles] = useState<RES_DetallePrestamo[]>([]);
  const [entregas, setEntregas] = useState<RES_EntregaPrestamo[]>([]);
  
  // Modales
  const [openedTrace, { open: openTrace, close: closeTrace }] = useDisclosure(false);
  const [openedAprobar, { open: openAprobar, close: closeAprobar }] = useDisclosure(false);
  const [openedRechazo, { open: openRechazo, close: closeRechazo }] = useDisclosure(false);
  const [openedNuevaEntrega, { open: openNuevaEntrega, close: closeNuevaEntrega }] = useDisclosure(false);
  const [openedHistorial, { open: openHistorial, close: closeHistorial }] = useDisclosure(false);

  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [comentarioAccion, setComentarioAccion] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [trazabilidad, setTrazabilidad] = useState<RES_TrazabilidadPrestamo[]>([]);
  const [loadingTrace, setLoadingTrace] = useState(false);

  // Selección múltiple para despacho
  const [selectedItemsIds, setSelectedItemsIds] = useState<number[]>([]);

  const toggleItemSelection = useCallback((id: number) => {
    setSelectedItemsIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const deselectAllItems = useCallback(() => setSelectedItemsIds([]), []);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await PrestamosAtencionService.obtenerDetallePrestamo(idPrestamo);
      if (res.success) {
        setDetalles(res.data.detalles);
        setEntregas(res.data.entregas);
      }
    } catch {
      notifyError("Error al cargar el detalle del préstamo");
    } finally {
      setLoading(false);
    }
  }, [idPrestamo, notifyError]);

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

  const handleCambiarEstado = useCallback(async (nuevoEstado: string) => {
    if (!selectedItemId) return;
    setIsProcessing(true);
    try {
      const res = await PrestamosAtencionService.cambiarEstadoDetalle({
        id_prestamo_detalle: selectedItemId,
        nuevo_estado: nuevoEstado,
        comentario: comentarioAccion
      });
      if (res.success) {
        notifySuccess(res.message || "Estado actualizado");
        setComentarioAccion("");
        closeAprobar();
        closeRechazo();
        cargarDatos();
        onSuccess?.();
      }
    } catch {
      notifyError("No se pudo actualizar el estado");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedItemId, comentarioAccion, cargarDatos, closeAprobar, closeRechazo, notifyError, notifySuccess, onSuccess]);

  const progresoGeneral = useMemo(() => {
    if (detalles.length === 0) return 0;
    const totalSolicitado = detalles.reduce((acc, d) => acc + (d.cantidad_solicitada_base || 0), 0);
    const totalEntregado = detalles.reduce((acc, d) => acc + (d.cantidad_prestada_base || 0), 0);
    if (totalSolicitado === 0) return 0;
    return Math.round((totalEntregado / totalSolicitado) * 100);
  }, [detalles]);

  return {
    loading,
    detalles,
    entregas,
    progresoGeneral,
    // Modales
    openedTrace, openTrace, closeTrace,
    openedAprobar, openAprobar, closeAprobar,
    openedRechazo, openRechazo, closeRechazo,
    openedNuevaEntrega, openNuevaEntrega, closeNuevaEntrega,
    openedHistorial, openHistorial, closeHistorial,
    // Estado Selección
    selectedItemId, setSelectedItemId,
    selectedItemName, setSelectedItemName,
    comentarioAccion, setComentarioAccion,
    isProcessing,
    trazabilidad,
    loadingTrace,
    obtenerTrazabilidad,
    handleCambiarEstado,
    // Selección múltiple
    selectedItemsIds,
    toggleItemSelection,
    deselectAllItems,
    cargarDatos
  };
};
