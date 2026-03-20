import { useState, useEffect, useMemo, useCallback } from "react";
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
  idEmpleadoSolicitante: number;
  onSuccess: (entregados: Record<number, number>) => void;
}

export const useRegistrarEntregaBatch = ({
  idRequerimiento,
  idAlmacen,
  selectedItemsIds,
  detallesRequerimiento,
  idEmpleadoSolicitante,
  onSuccess,
}: UseRegistrarEntregaBatchProps) => {
  const authUser = useAuthUser();
  const loggedEmployeeId = authUser.usuario?.id_empleado;

  const [loading, setLoading] = useState(true);
  const [lotes, setLotes] = useState<RES_Lote[]>([]);
  const [empleados, setEmpleados] = useState<
    { value: string; label: string }[]
  >([]);

  const [entregaCantidades, setEntregaCantidades] = useState<
    Record<number, Record<number, number>>
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

          // Initialize quantities per detail
          const initial: Record<number, Record<number, number>> = {};
          selectedDetalles.forEach((d) => {
            initial[d.id_requerimiento_almacen_detalle] = {};
            castedLotes
              .filter((l) => l.id_producto === d.id_producto)
              .forEach((l) => {
                initial[d.id_requerimiento_almacen_detalle][l.id_lote] = 0;
              });
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
  }, [idsProductos, idAlmacen, loggedEmployeeId, selectedDetalles]);

  // Auto-seleccionar receptor basado en el solicitante
  useEffect(() => {
    if (idEmpleadoSolicitante && empleados.length > 0 && !idEmpleadoRecibe) {
      const exists = empleados.some(
        (e) => e.value === idEmpleadoSolicitante.toString(),
      );
      if (exists) {
        setIdEmpleadoRecibe(idEmpleadoSolicitante.toString());
      }
    }
  }, [idEmpleadoSolicitante, empleados, idEmpleadoRecibe]);

  const handleCantChange = useCallback(
    (idDetalleReq: number, idLote: number, val: number) => {
      setEntregaCantidades((prev) => {
        const lote = lotes.find((l) => l.id_lote === idLote);
        if (!lote) return prev;

        const detail = selectedDetalles.find(
          (d) => d.id_requerimiento_almacen_detalle === idDetalleReq,
        );
        if (!detail) return prev;

        // Suma de lo entregado en OTROS lotes para ESTE MISMO requerimiento detalle
        const prevCantidadesForThisItem = prev[idDetalleReq] || {};
        const totalOtherLotsForThisItem = Object.entries(
          prevCantidadesForThisItem,
        ).reduce((sum, [lId, v]) => {
          if (Number(lId) === idLote) return sum;
          return sum + (v || 0);
        }, 0);

        // Suma de lo entregado en CUALQUIER requerimiento detalle para ESTE LOTE
        const totalOtherItemsForThisLot = Object.entries(prev).reduce(
          (sum, [dId, lotesMap]) => {
            if (Number(dId) === idDetalleReq) return sum;
            return sum + (lotesMap[idLote] || 0);
          },
          0,
        );

        const pendienteMaxDetalle =
          detail.cantidad_solicitada_base - detail.cantidad_entregada_base;

        // Máximo que puede aportar este lote al ítem específico:
        // El menor entre (su stock disponible REAL) y (lo que falta por entregar para el ítem)
        const stockRealRestanteLote =
          (lote.stock_actual_base || 0) - totalOtherItemsForThisLot;

        const maxAllowedForThisLoteAndItem = Math.max(
          0,
          Math.min(
            stockRealRestanteLote,
            pendienteMaxDetalle - totalOtherLotsForThisItem,
          ),
        );

        const finalValue = Math.max(
          0,
          Math.min(val || 0, maxAllowedForThisLoteAndItem),
        );

        if (prevCantidadesForThisItem[idLote] === finalValue) return prev;

        return {
          ...prev,
          [idDetalleReq]: {
            ...prevCantidadesForThisItem,
            [idLote]: finalValue,
          },
        };
      });
    },
    [lotes, selectedDetalles],
  );

  const handleCantLoteChange = useCallback(
    (idDetalleReq: number, idLote: number, valLote: number) => {
      const lote = lotes.find((l) => l.id_lote === idLote);
      if (!lote) return;
      const equiv = Number(lote.contenido_por_presentacion) || 1;
      // Usamos toFixed para redondear a la precisión de base y evitar errores de punto flotante
      const valBase = Number((valLote * equiv).toFixed(4));
      handleCantChange(idDetalleReq, idLote, valBase);
    },
    [lotes, handleCantChange],
  );

  const lotesPorProducto = useMemo(() => {
    const agrupado: Record<number, RES_Lote[]> = {};
    lotes.forEach((l) => {
      if (!agrupado[l.id_producto]) agrupado[l.id_producto] = [];
      agrupado[l.id_producto].push(l);
    });
    return agrupado;
  }, [lotes]);

  const totalEntregaGeneralBase = useMemo(() => {
    let total = 0;
    Object.values(entregaCantidades).forEach((lotesMap) => {
      Object.values(lotesMap).forEach((val) => {
        total += val || 0;
      });
    });
    return total;
  }, [entregaCantidades]);

  const handleConfirmar = async () => {
    if (!idEmpleadoRecibe) {
      setError("Debe seleccionar quién recibe los materiales");
      return;
    }
    setError("");

    const detallesParaApi: DTO_RegistrarEntregaDetalle[] = [];

    Object.entries(entregaCantidades).forEach(([idDet, lotesMap]) => {
      const idDetalleReq = Number(idDet);
      const detail = selectedDetalles.find(
        (d) => d.id_requerimiento_almacen_detalle === idDetalleReq,
      );
      if (!detail) return;

      Object.entries(lotesMap).forEach(([idLot, cant]) => {
        if (cant > 0) {
          const numIdLote = Number(idLot);
          const lote = lotes.find((l) => l.id_lote === numIdLote);
          if (!lote) return;

          const equivLote = lote.contenido_por_presentacion || 1;
          const cBase = cant;
          const cLote = cBase / equivLote;
          const cReq = cBase / detail.equivReq;

          detallesParaApi.push({
            id_requerimiento_almacen_detalle: idDetalleReq,
            id_lote_producto: numIdLote,
            cantidad_base: cBase,
            cantidad_lote: cLote,
            cantidad_requerimiento: cReq,
          });
        }
      });
    });

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
        // Calcular totales entregados por id_requerimiento_almacen_detalle
        const entregados: Record<number, number> = {};
        detallesParaApi.forEach((ent) => {
          const id = ent.id_requerimiento_almacen_detalle;
          entregados[id] = (entregados[id] || 0) + ent.cantidad_base;
        });

        onSuccess(entregados);
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
