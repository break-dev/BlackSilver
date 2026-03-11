import { useState, useCallback, useEffect, useMemo } from "react";
import { useDisclosure } from "@mantine/hooks";
import { EstadoDetalleRequerimiento } from "../../../shared/enums/estados";
import { useEntregas } from "./useEntregas";
import type { RES_DetalleRequerimiento, RES_Trazabilidad } from "../service/atencion.responses";

interface UseGestionAtencionProps {
  idRequerimiento: number;
  onSuccess: () => void;
}

interface DetalleState {
  detalles: RES_DetalleRequerimiento[];
}

export const useGestionAtencion = ({ idRequerimiento, onSuccess }: UseGestionAtencionProps) => {
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState<DetalleState | null>(null);
  const [error, setError] = useState("");
  const [eventos, setEventos] = useState<RES_Trazabilidad[]>([]);
  const [loadingTrazabilidad, setLoadingTrazabilidad] = useState(false);

  // Modal Control
  const [openedTrace, { open: openTrace, close: closeTrace }] = useDisclosure(false);
  const [openedEntrega, { open: openEntrega, close: closeEntrega }] = useDisclosure(false);
  const [openedRechazo, { open: openRechazo, close: closeRechazo }] = useDisclosure(false);

  // Selected Data
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [selectedItemSolicitado, setSelectedItemSolicitado] = useState(0);
  const [selectedItemAtendido, setSelectedItemAtendido] = useState(0);
  const [rechazoMotivo, setRechazoMotivo] = useState("");
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  const { 
    cambiarEstadoDetalle, 
    obtenerTrazabilidad,
    obtenerDetallesRequerimiento 
  } = useEntregas({ setError });

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await obtenerDetallesRequerimiento(idRequerimiento);
      if (res) {
          setDetalle((prev) => ({ ...prev, detalles: res } as DetalleState));
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [idRequerimiento, obtenerDetallesRequerimiento]);

  useEffect(() => {
    loadData();
  }, [idRequerimiento, loadData]);

  useEffect(() => {
    if (openedTrace && selectedItemId) {
      const loadTrace = async () => {
        setLoadingTrazabilidad(true);
        const res = await obtenerTrazabilidad(selectedItemId);
        setEventos(res || []);
        setLoadingTrazabilidad(false);
      };
      loadTrace();
    }
  }, [openedTrace, selectedItemId, obtenerTrazabilidad]);

  const handleAprobar = useCallback(async (idDetalle: number) => {
    setIsProcessing(idDetalle);
    try {
      const ok = await cambiarEstadoDetalle({
        id_requerimiento_almacen_detalle: idDetalle,
        nuevo_estado: EstadoDetalleRequerimiento.Aprobado,
      });
      if (ok) {
        await loadData(true);
        onSuccess();
      }
    } finally {
      setIsProcessing(null);
    }
  }, [cambiarEstadoDetalle, loadData, onSuccess]);

  const handleRechazar = useCallback(async () => {
    if (!selectedItemId) return;
    setIsProcessing(selectedItemId);
    try {
      const ok = await cambiarEstadoDetalle({
        id_requerimiento_almacen_detalle: selectedItemId,
        nuevo_estado: EstadoDetalleRequerimiento.Rechazado,
        comentario_decision: rechazoMotivo,
      });
      if (ok) {
        closeRechazo();
        setRechazoMotivo("");
        await loadData(true);
        onSuccess();
      }
    } finally {
      setIsProcessing(null);
    }
  }, [selectedItemId, rechazoMotivo, cambiarEstadoDetalle, closeRechazo, loadData, onSuccess]);

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
    if (!detalle || !detalle.detalles || detalle.detalles.length === 0) return 0;

    // Solo promediamos los productos que están "Aprobados" o en un estado posterior (hasta completado)
    // No contamos los "Rechazados" o "Anulados" en el promedio de atención si el usuario lo prefiere así,
    // pero usualmente se promedia lo que es "atendible".
    const itemsAtendibles = detalle.detalles.filter(item => 
      item.estado !== EstadoDetalleRequerimiento.Rechazado.toString() &&
      item.estado !== EstadoDetalleRequerimiento.EsperandoAprobacion.toString() &&
      (item.estado as string) !== "Anulado" // Por si acaso
    );

    if (itemsAtendibles.length === 0) return 0;

    const sumaProgreso = itemsAtendibles.reduce((acc, item) => {
      return acc + Number(item.porcentaje_progreso || 0);
    }, 0);

    return Math.round(sumaProgreso / itemsAtendibles.length);
  }, [detalle]);

  return {
    loading,
    detalle,
    error,
    eventos,
    loadingTrazabilidad,
    openedTrace, openTrace, closeTrace,
    openedEntrega, openEntrega, closeEntrega,
    openedRechazo, openRechazo, closeRechazo,
    selectedItemId, setSelectedItemId,
    selectedItemName, setSelectedItemName,
    selectedItemSolicitado, setSelectedItemSolicitado,
    selectedItemAtendido, setSelectedItemAtendido,
    rechazoMotivo, setRechazoMotivo,
    isProcessing,
    progresoGeneral,
    handleAprobar,
    handleRechazar,
    getStatusColor,
    loadData
  };
};
