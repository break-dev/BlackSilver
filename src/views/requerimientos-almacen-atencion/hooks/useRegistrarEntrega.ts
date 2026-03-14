import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import type {
  RES_DetalleRequerimiento,
  RES_Lote,
  RES_Empleado,
  DetalleRequerimientoExtendido,
} from "../service/atencion.responses";
import { AtencionService } from "../service/atencion.service";
import type { DTO_RegistrarEntregaDetalle } from "../service/atencion.requests";
import { useAuthUser } from "../../../hooks/useAuthUser";

interface UseRegistrarEntregaBatchProps {
  idRequerimiento: number;
  idAlmacen: number;
  selectedItemsIds: number[];
  detallesRequerimiento: RES_DetalleRequerimiento[];
  onSuccess: () => void;
}

export const useRegistrarEntregaBatch = ({
  idRequerimiento,
  idAlmacen,
  selectedItemsIds,
  detallesRequerimiento,
  onSuccess,
}: UseRegistrarEntregaBatchProps) => {
  const authUser = useAuthUser();
  const loggedEmployeeId = authUser?.id_empleado;

  const [loading, setLoading] = useState(true);
  const [lotes, setLotes] = useState<RES_Lote[]>([]);
  const [empleados, setEmpleados] = useState<
    { value: string; label: string }[]
  >([]);

  const [entregaCantidades, setEntregaCantidades] = useState<
    Record<number, number>
  >({});
  const [idEmpleadoRecibe, setIdEmpleadoRecibe] = useState<string | null>(null);
  const [observacion, setObservacion] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedDetalles = useMemo<DetalleRequerimientoExtendido[]>(() => {
    return detallesRequerimiento
      .filter((d) =>
        selectedItemsIds.includes(d.id_requerimiento_almacen_detalle),
      )
      .map((d) => {
        const cSolicitada = Number(d.cantidad_solicitada || 0);
        const cSolicitadaBase = Number(d.cantidad_solicitada_base || 0);
        const cEntregadaBase = Number(d.cantidad_entregada_base || 0);
        const pendienteBase = cSolicitadaBase - cEntregadaBase;

        return {
          ...d,
          cantidad_solicitada: cSolicitada,
          cantidad_solicitada_base: cSolicitadaBase,
          cantidad_entregada_base: cEntregadaBase,
          pendiente_base: Math.max(0, pendienteBase),
          equivReq: cSolicitada > 0 ? cSolicitadaBase / cSolicitada : 1,
        };
      });
  }, [detallesRequerimiento, selectedItemsIds]);

  const idsProductos = useMemo(() => {
    const ids = selectedDetalles.map((d) => d.id_producto);
    return Array.from(new Set(ids));
  }, [selectedDetalles]);

  useEffect(() => {
    let cancelled = false;
    const loadInitialData = async () => {
      if (idsProductos.length === 0) return;
      setLoading(true);
      setError("");
      try {
        const [resEmps, resLotes] = await Promise.all([
          AtencionService.obtenerEmpleados(),
          AtencionService.obtenerLotesDisponibles(idsProductos, idAlmacen),
        ]);

        if (cancelled) return;

        if (resLotes.success) {
          const castedLotes = resLotes.data.map((l: RES_Lote) => ({
            ...l,
            stock_actual: Number(l.stock_actual),
            stock_actual_base: Number(l.stock_actual_base),
            contenido_por_presentacion: Number(l.contenido_por_presentacion),
          }));
          setLotes(castedLotes);

          // Initialize quantities
          const initial: Record<number, number> = {};
          castedLotes.forEach((l) => {
            initial[l.id_lote] = 0;
          });
          setEntregaCantidades(initial);
        }

        if (resEmps.success) {
          const exceptLogged = resEmps.data.filter(
            (e: RES_Empleado) => e.id_empleado !== loggedEmployeeId,
          );
          setEmpleados(
            exceptLogged.map((e: RES_Empleado) => ({
              value: e.id_empleado?.toString() || "",
              label: e.nombre_completo,
            })),
          );
        }
      } catch (err) {
        if (!cancelled) setError("Error al cargar datos necesarios");
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadInitialData();
    return () => {
      cancelled = true;
    };
  }, [idsProductos, idAlmacen, loggedEmployeeId]);

  const handleCantChange = (
    idLote: number,
    idProducto: number,
    val: number,
  ) => {
    const lote = lotes.find((l) => l.id_lote === idLote);
    if (!lote) return;

    // Validar maximo (stock del lote vs pendiente del requerimiento detalle de ese producto)
    const detalleRelacionado = selectedDetalles.find(
      (d) => d.id_producto === idProducto,
    );
    if (!detalleRelacionado) return;

    // Cuanto de los lotes de este producto se esta entregando (excluyendo el actual editado)
    const currentTotalExcludingThisLoteParaProducto = lotes
      .filter((l) => l.id_producto === idProducto && l.id_lote !== idLote)
      .reduce((sum, l) => sum + (entregaCantidades[l.id_lote] || 0), 0);

    const maxAllowedForThisLote = Math.min(
      lote.stock_actual_base || 0,
      detalleRelacionado.cantidad_solicitada_base -
        detalleRelacionado.cantidad_entregada_base -
        currentTotalExcludingThisLoteParaProducto,
    );

    const newValue = Math.max(0, Math.min(val, maxAllowedForThisLote));

    setEntregaCantidades((p) => ({
      ...p,
      [idLote]: newValue,
    }));
  };

  const handleCantLoteChange = (
    idLote: number,
    idProducto: number,
    valLote: number,
  ) => {
    const lote = lotes.find((l) => l.id_lote === idLote);
    if (!lote) return;
    const equiv = Number(lote.contenido_por_presentacion) || 1;
    const valBase = Number((valLote * equiv).toFixed(4));
    handleCantChange(idLote, idProducto, valBase);
  };

  const lotesPorProducto = useMemo(() => {
    const agrupado: Record<number, RES_Lote[]> = {};
    lotes.forEach((l) => {
      if (!agrupado[l.id_producto]) agrupado[l.id_producto] = [];
      agrupado[l.id_producto].push(l);
    });
    return agrupado;
  }, [lotes]);

  const totalEntregaGeneralBase = useMemo(() => {
    return Object.values(entregaCantidades).reduce(
      (acc, val) => acc + (val || 0),
      0,
    );
  }, [entregaCantidades]);

  const handleConfirmar = async () => {
    if (!idEmpleadoRecibe) {
      setError("Debe seleccionar quién recibe los materiales");
      return;
    }
    setError("");

    const detallesParaApi: DTO_RegistrarEntregaDetalle[] = [];

    for (const [idLote, cant] of Object.entries(entregaCantidades)) {
      if (cant > 0) {
        const numIdLote = Number(idLote);
        const lote = lotes.find((l) => l.id_lote === numIdLote);
        if (!lote) continue;

        const detalleReq = selectedDetalles.find(
          (d) => d.id_producto === lote.id_producto,
        );
        if (!detalleReq) continue;

        const equivLote = lote.contenido_por_presentacion || 1;
        const cBase = cant;
        const cLote = cBase / equivLote;
        const cReq = cBase / detalleReq.equivReq;

        detallesParaApi.push({
          id_requerimiento_almacen_detalle:
            detalleReq.id_requerimiento_almacen_detalle,
          id_lote_producto: numIdLote,
          cantidad_base: cBase,
          cantidad_lote: cLote,
          cantidad_requerimiento: cReq,
        });
      }
    }

    if (detallesParaApi.length === 0) {
      setError("Debe entregar al menos 1 producto");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await AtencionService.registrarEntrega({
        id_requerimiento: idRequerimiento,
        id_empleado_recibe: Number(idEmpleadoRecibe),
        fecha_entrega: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        observacion,
        detalles: detallesParaApi,
      });

      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || "Error al registrar entrega batch");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    loading,
    selectedDetalles,
    lotesPorProducto,
    entregaCantidades,
    empleados,
    idEmpleadoRecibe,
    setIdEmpleadoRecibe,
    observacion,
    setObservacion,
    error,
    isProcessing,
    totalEntregaGeneralBase,
    handleCantChange,
    handleCantLoteChange,
    handleConfirmar,
  };
};
