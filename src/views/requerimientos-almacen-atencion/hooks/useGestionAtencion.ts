import { useState, useCallback, useEffect, useMemo } from "react";
import { useDisclosure } from "@mantine/hooks";
import { EstadoDetalleRequerimiento } from "../../../shared/enums/estados";
import { AtencionService } from "../service/atencion.service";
import type { 
  RES_Trazabilidad,
  DetalleRequerimientoExtendido 
} from "../service/atencion.responses";
import type { AxiosError } from "axios";

interface UseGestionAtencionProps {
  idRequerimiento: number;
  onSuccess: () => void;
}

export const useGestionAtencion = ({ idRequerimiento, onSuccess }: UseGestionAtencionProps) => {
  const [loading, setLoading] = useState(true);
  const [detalles, setDetalles] = useState<DetalleRequerimientoExtendido[]>([]);
  const [error, setError] = useState("");
  const [eventos, setEventos] = useState<RES_Trazabilidad[]>([]);
  const [loadingTrazabilidad, setLoadingTrazabilidad] = useState(false);

  // Modal Control
  const [openedTrace, { open: openTrace, close: closeTrace }] = useDisclosure(false);
  const [openedRechazo, { open: openRechazo, close: closeRechazo }] = useDisclosure(false);
  const [openedAprobar, { open: openAprobar, close: closeAprobar }] = useDisclosure(false);
  const [openedEntregaBatch, { open: openEntregaBatch, close: closeEntregaBatch }] = useDisclosure(false);
  const [openedHistorialGlobal, { open: openHistorialGlobal, close: closeHistorialGlobal }] = useDisclosure(false);

  // Selected Data
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [comentarioAccion, setComentarioAccion] = useState("");
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  // Batch Selection
  const [selectedItemsIds, setSelectedItemsIds] = useState<number[]>([]);

  const toggleItemSelection = useCallback((id: number) => {
    setSelectedItemsIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const deselectAllItems = useCallback(() => {
    setSelectedItemsIds([]);
  }, []);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const resp = await AtencionService.obtenerDetallesRequerimiento(idRequerimiento);
      if (resp.success) {
          setDetalles(resp.data.map(d => ({
              ...d,
              pendiente_base: d.cantidad_solicitada_base - d.cantidad_entregada_base,
              equivReq: d.cantidad_solicitada > 0 ? d.cantidad_solicitada_base / d.cantidad_solicitada : 1
          })));
      } else {
          setError(resp.message || "Error al obtener detalles");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Error de conexión");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [idRequerimiento]);

  useEffect(() => {
    loadData();
  }, [idRequerimiento, loadData]);

  useEffect(() => {
    if (openedTrace && selectedItemId) {
      const loadTrace = async () => {
        setLoadingTrazabilidad(true);
        try {
          const res = await AtencionService.obtenerTrazabilidad(selectedItemId);
          if (res.success) {
            setEventos(res.data);
          } else {
            setEventos([]);
          }
        } catch {
          setEventos([]);
        }
        setLoadingTrazabilidad(false);
      };
      loadTrace();
    }
  }, [openedTrace, selectedItemId]);

  const handleAprobar = useCallback(async () => {
    if (!selectedItemId) return;
    setIsProcessing(selectedItemId);
    setError("");
    try {
      const res = await AtencionService.cambiarEstadoDetalle({
        id_requerimiento_almacen_detalle: selectedItemId,
        nuevo_estado: EstadoDetalleRequerimiento.Aprobado,
        comentario_decision: comentarioAccion,
      });
      if (res.success) {
        closeAprobar();
        const motivo = comentarioAccion;
        setComentarioAccion("");
        setDetalles((prev) => 
            prev.map(item => 
                item.id_requerimiento_almacen_detalle === selectedItemId 
                ? { ...item, estado: EstadoDetalleRequerimiento.Aprobado, comentario_decision: motivo } 
                : item
            )
        );
        onSuccess();
      } else {
        setError(res.message || "Error al aprobar");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Error de conexión");
    } finally {
      setIsProcessing(null);
    }
  }, [selectedItemId, comentarioAccion, closeAprobar, onSuccess]);

  const handleRechazar = useCallback(async () => {
    if (!selectedItemId) return;
    setIsProcessing(selectedItemId);
    setError("");
    try {
      const res = await AtencionService.cambiarEstadoDetalle({
        id_requerimiento_almacen_detalle: selectedItemId,
        nuevo_estado: EstadoDetalleRequerimiento.Rechazado,
        comentario_decision: comentarioAccion,
      });
      if (res.success) {
        closeRechazo();
        const motivo = comentarioAccion;
        setComentarioAccion("");
        setDetalles((prev) => 
            prev.map(item => 
                item.id_requerimiento_almacen_detalle === selectedItemId 
                ? { ...item, estado: EstadoDetalleRequerimiento.Rechazado, comentario_decision: motivo } 
                : item
            )
        );
        onSuccess();
      } else {
        setError(res.message || "Error al rechazar");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Error de conexión");
    } finally {
      setIsProcessing(null);
    }
  }, [selectedItemId, comentarioAccion, closeRechazo, onSuccess]);

  const getStatusColor = (status: string) => {
    if (status === EstadoDetalleRequerimiento.EsperandoAprobacion.toString()) return "blue";
    if (status === EstadoDetalleRequerimiento.Aprobado.toString()) return "violet";
    if (status === EstadoDetalleRequerimiento.EnDespacho.toString()) return "orange";
    if (status === EstadoDetalleRequerimiento.NuevaEntrega.toString()) return "green";
    if (status === EstadoDetalleRequerimiento.Completado.toString()) return "teal";
    if (status === EstadoDetalleRequerimiento.Rechazado.toString()) return "red";
    return "zinc";
  };

  const progresoGeneral = useMemo(() => {
    if (detalles.length === 0) return 0;

    const itemsAtendibles = detalles.filter(item => 
      item.estado !== EstadoDetalleRequerimiento.Rechazado.toString() &&
      item.estado !== EstadoDetalleRequerimiento.EsperandoAprobacion.toString() &&
      (item.estado as string) !== "Anulado"
    );

    if (itemsAtendibles.length === 0) return 0;

    const sumaProgreso = itemsAtendibles.reduce((acc, item) => {
      return acc + Number(item.porcentaje_progreso || 0);
    }, 0);

    return Math.round(sumaProgreso / itemsAtendibles.length);
  }, [detalles]);

  return {
    loading,
    detalles,
    error,
    eventos,
    loadingTrazabilidad,
    openedTrace, openTrace, closeTrace,
    openedRechazo, openRechazo, closeRechazo,
    openedAprobar, openAprobar, closeAprobar,
    openedEntregaBatch, openEntregaBatch, closeEntregaBatch,
    openedHistorialGlobal, openHistorialGlobal, closeHistorialGlobal,
    selectedItemId, setSelectedItemId,
    selectedItemName, setSelectedItemName,
    selectedItemsIds, toggleItemSelection, deselectAllItems,
    comentarioAccion, setComentarioAccion,
    isProcessing,
    progresoGeneral,
    handleAprobar,
    handleRechazar,
    getStatusColor,
    loadData
  };
};
