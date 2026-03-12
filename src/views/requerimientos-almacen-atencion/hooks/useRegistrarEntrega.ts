import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import type { 
  RES_DetalleRequerimiento, 
  RES_Entrega, 
  RES_Lote,
  RES_Empleado
} from "../service/atencion.responses";
import { AtencionService } from "../service/atencion.service";
import type { AxiosError } from "axios";
interface UseRegistrarEntregaProps {
  idRequerimiento: number;
  idRequerimientoDetalle: number;
  idProducto: number;
  idAlmacen: number;
  onSuccess: () => void;
}

export const useRegistrarEntrega = ({
  idRequerimiento,
  idRequerimientoDetalle,
  idProducto,
  idAlmacen,
  onSuccess,
}: UseRegistrarEntregaProps) => {
  const [loading, setLoading] = useState(true);
  const [itemData, setItemData] = useState<RES_DetalleRequerimiento & { pendiente_base: number; lotes: RES_Lote[] } | null>(null);
  const [historial, setHistorial] = useState<RES_Entrega[]>([]);
  const [entregaCantidades, setEntregaCantidades] = useState<Record<number, number>>({});
  const [idEmpleadoRecibe, setIdEmpleadoRecibe] = useState<string | null>(null);
  const [observacion, setObservacion] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [empleados, setEmpleados] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    const loadInitialData = async () => {
      setLoading(true);
      setError("");
      try {
        const [resDetalles, resHistorial, resEmps, resLotes] = await Promise.all([
          AtencionService.obtenerDetallesRequerimiento(idRequerimiento),
          AtencionService.obtenerHistorialEntregas(idRequerimientoDetalle),
          AtencionService.obtenerEmpleados(),
          AtencionService.obtenerLotesDisponibles(idProducto, idAlmacen),
        ]);

        if (cancelled) return;

        const dataDetalles = resDetalles.success ? resDetalles.data : [];
        const dataHistorial = resHistorial.success ? resHistorial.data : [];
        const dataEmps = resEmps.success ? resEmps.data : [];
        const dataLotes = resLotes.success ? resLotes.data : [];

        const found = dataDetalles.find(
          (d: RES_DetalleRequerimiento) => d.id_requerimiento_almacen_detalle === idRequerimientoDetalle,
        );
        if (found) {
          const cSolicitada = Number(found.cantidad_solicitada);
          const cSolicitadaBase = Number(found.cantidad_solicitada_base);
          const cEntregadaBase = Number(found.cantidad_entregada_base);
          
          const pendienteBase = cSolicitadaBase - cEntregadaBase;
          
          const castedLotes = dataLotes.map((l: RES_Lote) => ({
            ...l,
            stock_actual: Number(l.stock_actual),
            stock_actual_base: Number(l.stock_actual_base),
            contenido_por_presentacion: Number(l.contenido_por_presentacion)
          }));

          setItemData({
            ...found,
            cantidad_solicitada: cSolicitada,
            cantidad_solicitada_base: cSolicitadaBase,
            cantidad_entregada_base: cEntregadaBase,
            pendiente_base: pendienteBase,
            lotes: castedLotes
          });
        }

        setHistorial(dataHistorial);
        setEmpleados(
          dataEmps.map((e: RES_Empleado) => ({
            value: e.id_empleado?.toString() || "",
            label: e.nombre_completo,
          })),
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadInitialData();
    return () => {
      cancelled = true;
    };
  }, [idRequerimiento, idRequerimientoDetalle, idProducto, idAlmacen]);

  const totalEntregaBase = useMemo(() => {
    return Object.values(entregaCantidades).reduce(
      (acc, curr) => acc + (curr || 0),
      0,
    );
  }, [entregaCantidades]);

  useEffect(() => {
    if (!itemData || !itemData.lotes) return;
    const initial: Record<number, number> = {};
    itemData.lotes.forEach((l) => {
      initial[l.id_lote] = 0;
    });
    setEntregaCantidades(initial);
  }, [itemData]);

  const handleCantChange = (idLote: number, val: number) => {
    if (!itemData || !itemData.lotes) return;
    const lote = itemData.lotes.find((l) => l.id_lote === idLote);
    if (!lote) return;

    const currentTotalExcludingThisLote =
      totalEntregaBase - (entregaCantidades[idLote] || 0);
    const maxAllowedForThisLote = Math.min(
      lote.stock_actual_base || 0,
      (itemData.pendiente_base || 0) - currentTotalExcludingThisLote,
    );

    const newValue = Math.max(0, Math.min(val, maxAllowedForThisLote));

    setEntregaCantidades((p) => ({
      ...p,
      [idLote]: newValue,
    }));
  };

  const handleConfirmar = async () => {
    if (!idEmpleadoRecibe) {
      setError("Debe seleccionar quién recibe el material");
      return;
    }

    if (!itemData || !itemData.lotes) return;

    const equivReq =
      itemData.cantidad_solicitada > 0
        ? itemData.cantidad_solicitada_base / itemData.cantidad_solicitada
        : 1;

    const detalles = Object.entries(entregaCantidades)
      .filter(([, cant]) => cant > 0)
      .map(([idLote, cant]) => {
        const lote = itemData.lotes!.find(
          (l) => l.id_lote === Number(idLote),
        )!;
        const equivLote = lote.contenido_por_presentacion || 1;
        const cBase = cant;
        const cLote = cBase / equivLote;
        const cReq = cBase / equivReq;

        return {
          id_requerimiento_almacen_detalle: idRequerimientoDetalle,
          id_lote: Number(idLote),
          cantidad_base: cBase,
          cantidad_lote: cLote,
          cantidad_requerimiento: cReq,
        };
      });

    if (detalles.length === 0) return;

    setIsProcessing(true);
    setError("");
    try {
      const res = await AtencionService.registrarEntrega({
        id_requerimiento: idRequerimiento,
        id_empleado_recibe: Number(idEmpleadoRecibe),
        fecha_entrega: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        observacion,
        detalles,
      });

      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || "Error al registrar entrega");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Error de conexión");
    } finally {
      setIsProcessing(false);
    }
  };

  const equivReq = useMemo(() => {
    if (!itemData) return 1;
    return itemData.cantidad_solicitada > 0
      ? itemData.cantidad_solicitada_base / itemData.cantidad_solicitada
      : 1;
  }, [itemData]);

  const stockDisponibleBase = useMemo(() => {
    if (!itemData || !itemData.lotes) return 0;
    return (itemData.lotes || []).reduce(
      (sum: number, l: RES_Lote) => sum + Number(l.stock_actual_base || 0),
      0,
    );
  }, [itemData]);

  return {
    loading,
    itemData,
    historial,
    entregaCantidades,
    idEmpleadoRecibe, setIdEmpleadoRecibe,
    observacion, setObservacion,
    error, setError,
    isProcessing,
    empleados,
    totalEntregaBase,
    equivReq,
    stockDisponibleBase,
    handleCantChange,
    handleConfirmar
  };
};
