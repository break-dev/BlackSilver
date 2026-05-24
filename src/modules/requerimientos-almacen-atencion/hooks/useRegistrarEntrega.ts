import { useState, useEffect, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import type { DetalleRequerimientoExtendido } from "../service/atencion.responses";
import { AtencionService } from "../service/atencion.service";
import type { DTO_RegistrarEntregaDetalle } from "../service/atencion.requests";
import { useAuthUser } from "../../../hooks/useAuthUser";
import type { RES_LoteDisponible } from "../../../service/responses/lote-producto";
import type { RES_Empleado } from "../../../service/responses/empleado";
import type { RES_DetalleRequerimiento } from "../../../service/responses/requerimientos-almacen/requerimiento-almacen";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_ActivoFijoDisponible } from "../../../service/responses/activo-fijo";
import { TipoBien } from "../../../shared/enums/_generic/tipo-bien";
import { useNotify } from "../../../hooks/useNotify";

interface UseRegistrarEntregaBatchProps {
  idRequerimiento: number;
  idAlmacen: number;
  selectedItemsIds: number[];
  detallesRequerimiento: RES_DetalleRequerimiento[];
  idContratistaSolicitante: number;
  onSuccess: (entregados: Record<number, number>) => void;
}

export const useRegistrarEntregaBatch = ({
  idRequerimiento,
  idAlmacen,
  selectedItemsIds,
  detallesRequerimiento,
  idContratistaSolicitante,
  onSuccess,
}: UseRegistrarEntregaBatchProps) => {
  const authUser = useAuthUser();
  const { notifySuccess, notifyError } = useNotify();
  const loggedEmployeeId = authUser.usuario?.id_empleado;

  const [loading, setLoading] = useState(true);
  const [lotes, setLotes] = useState<RES_LoteDisponible[]>([]);
  const [activosFijos, setActivosFijos] = useState<RES_ActivoFijoDisponible[]>([]);
  const [entregaCantidadesActivos, setEntregaCantidadesActivos] = useState<
    Record<number, Record<number, number>>
  >({});
  const [empleados, setEmpleados] = useState<
    { value: string; label: string }[]
  >([]);

  const [entregaCantidades, setEntregaCantidades] = useState<
    Record<number, Record<number, number>>
  >({});
  const [idEmpleadoRecibe, setIdEmpleadoRecibe] = useState<string | null>(null);
  const [observacion, setObservacion] = useState("");
  const [evidencias, setEvidencias] = useState<File[]>([]);
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

  /** Items normales (con lote) */
  const detallesConLote = useMemo(
    () => selectedDetalles.filter((d) => d.tipo_bien !== TipoBien.ActivoFijo),
    [selectedDetalles],
  );

  /** Activos fijos: ya tienen id_activo_fijo_destino asignado desde el requerimiento */
  const detallesActivoFijo = useMemo(
    () => selectedDetalles.filter((d) => d.tipo_bien === TipoBien.ActivoFijo),
    [selectedDetalles],
  );

  const idsProductos = useMemo(() => {
    const ids = detallesConLote.map((d) => d.id_producto);
    return Array.from(new Set(ids));
  }, [detallesConLote]);

  useEffect(() => {
    let cancelled = false;
    const loadInitialData = async () => {
      setLoading(true);
      setError("");
      try {
        const idsConLote = Array.from(
          new Set(detallesConLote.map((d) => d.id_producto)),
        );
        const idsActivoFijo = Array.from(
          new Set(detallesActivoFijo.map((d) => d.id_producto)),
        );
        if (idsConLote.length === 0 && idsActivoFijo.length === 0) {
            setLoading(false);
            return;
        }

        const [resEmps, resLotes, resActivos] = await Promise.all([
          AuxService.get_empleados(),
          idsConLote.length > 0
            ? AuxService.get_lotes_disponibles(idAlmacen, idsConLote)
            : Promise.resolve({ success: true, data: [] }),
          idsActivoFijo.length > 0
            ? AuxService.get_activos_disponibles({
                id_almacen: idAlmacen,
                ids_productos: idsActivoFijo,
              })
            : Promise.resolve({ success: true, data: [] }),
        ]);

        if (cancelled) return;

        if (resLotes.success) {
          const castedLotes = resLotes.data.map((l: RES_LoteDisponible) => ({
            ...l,
            stock_actual: Number(l.stock_actual),
            stock_actual_base: Number(l.stock_actual_base),
            contenido_por_presentacion: Number(l.contenido_por_presentacion),
          }));
          setLotes(castedLotes);

          // Initialize quantities per detail (solo items con lote)
          const initial: Record<number, Record<number, number>> = {};
          detallesConLote.forEach((d) => {
            initial[d.id_requerimiento_almacen_detalle] = {};
            castedLotes
              .filter((l) => l.id_producto === d.id_producto)
              .forEach((l) => {
                initial[d.id_requerimiento_almacen_detalle][l.id_lote] = 0;
              });
          });
          setEntregaCantidades(initial);
        }

        if (resActivos.success) {
          setActivosFijos(resActivos.data);
          
          // Initialize quantities per detail for activos fijos
          const initialActivos: Record<number, Record<number, number>> = {};
          detallesActivoFijo.forEach((d) => {
            initialActivos[d.id_requerimiento_almacen_detalle] = {};
            resActivos.data
              .filter((a: RES_ActivoFijoDisponible) => a.id_producto === d.id_producto)
              .forEach((a: RES_ActivoFijoDisponible) => {
                initialActivos[d.id_requerimiento_almacen_detalle][a.id_activo] = 0;
              });
          });
          setEntregaCantidadesActivos(initialActivos);
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
  }, [
    idsProductos,
    idAlmacen,
    loggedEmployeeId,
    selectedDetalles,
    detallesConLote,
    detallesActivoFijo,
  ]);

  // Auto-seleccionar receptor basado en el solicitante
  useEffect(() => {
    if (idContratistaSolicitante && empleados.length > 0 && !idEmpleadoRecibe) {
      const exists = empleados.some(
        (e) => e.value === idContratistaSolicitante.toString(),
      );
      if (exists) {
        setIdEmpleadoRecibe(idContratistaSolicitante.toString());
      }
    }
  }, [idContratistaSolicitante, empleados, idEmpleadoRecibe]);

  const handleCantActivoChange = useCallback(
    (idDetalleReq: number, idActivo: number, val: number) => {
      setEntregaCantidadesActivos((prev) => {
        // limit val to 0 or 1
        const finalValue = Math.max(0, Math.min(val, 1));
        const prevCantidades = prev[idDetalleReq] || {};

        // Sum total selected for this detail
        const detail = selectedDetalles.find(
          (d) => d.id_requerimiento_almacen_detalle === idDetalleReq,
        );
        if (!detail) return prev;

        const totalOther = Object.entries(prevCantidades).reduce(
          (sum, [aId, v]) => {
            if (Number(aId) === idActivo) return sum;
            return sum + (v || 0);
          },
          0,
        );

        const pendienteMaxDetalle =
          detail.cantidad_solicitada_base - detail.cantidad_entregada_base;

        // Max allowed is 1, but bounded by remaining pending
        const maxAllowed = Math.max(
          0,
          Math.min(1, pendienteMaxDetalle - totalOther),
        );
        const safeValue = Math.max(0, Math.min(finalValue, maxAllowed));

        if (prevCantidades[idActivo] === safeValue) return prev;

        return {
          ...prev,
          [idDetalleReq]: {
            ...prevCantidades,
            [idActivo]: safeValue,
          },
        };
      });
    },
    [selectedDetalles],
  );

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
    const agrupado: Record<number, RES_LoteDisponible[]> = {};
    lotes.forEach((l) => {
      if (!agrupado[l.id_producto]) agrupado[l.id_producto] = [];
      agrupado[l.id_producto].push(l);
    });
    return agrupado;
  }, [lotes]);

  const totalEntregaGeneralBase = useMemo(() => {
    let total = 0;
    // Suma cantidades de lotes seleccionados
    Object.values(entregaCantidades).forEach((lotesMap) => {
      Object.values(lotesMap).forEach((val) => {
        total += val || 0;
      });
    });
    // Suma activos fijos seleccionados
    Object.values(entregaCantidadesActivos).forEach((activosMap) => {
      Object.values(activosMap).forEach((val) => {
        total += val || 0;
      });
    });
    return total;
  }, [entregaCantidades, entregaCantidadesActivos]);

  const handleConfirmar = async () => {
    if (!idEmpleadoRecibe) {
      setError("Debe seleccionar quién recibe los materiales");
      return;
    }
    setError("");

    const detallesParaApi: DTO_RegistrarEntregaDetalle[] = [];

    // --- Activos fijos ---
    Object.entries(entregaCantidadesActivos).forEach(([idDet, activosMap]) => {
      const idDetalleReq = Number(idDet);
      const detail = selectedDetalles.find(
        (d) => d.id_requerimiento_almacen_detalle === idDetalleReq,
      );
      if (!detail) return;

      Object.entries(activosMap).forEach(([idAct, cant]) => {
        if (cant > 0) {
          const numIdActivo = Number(idAct);
          const cBase = cant;
          const cLote = cant; // Same as base
          const cReq = cant; // Same as base because it's 1 unit always

          detallesParaApi.push({
            id_requerimiento_almacen_detalle: idDetalleReq,
            id_activo_fijo: numIdActivo,
            cantidad_base: cBase,
            cantidad_lote: cLote,
            cantidad_requerimiento: cReq,
          });
        }
      });
    });

    // --- Productos con lote ---
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
      setError("Debe entregar al menos 1 producto o activo");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await AtencionService.registrarEntrega({
        id_requerimiento: idRequerimiento,
        id_empleado_recibe: Number(idEmpleadoRecibe),
        fecha_entrega: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        observacion,
        evidencias,
        detalles: detallesParaApi,
      });

      if (res.success) {
        notifySuccess(res.message || "Entrega registrada exitosamente");
        // Calcular totales entregados por id_requerimiento_almacen_detalle
        const entregados: Record<number, number> = {};
        detallesParaApi.forEach((ent) => {
          const id = ent.id_requerimiento_almacen_detalle;
          entregados[id] = (entregados[id] || 0) + ent.cantidad_base;
        });

        onSuccess(entregados);
      } else {
        notifyError(res.message || "Error al registrar entrega batch");
        setError(res.message || "Error al registrar entrega batch");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión");
    } finally {
      setIsProcessing(false);
    }
  };

  const activosFijosPorProducto = useMemo(() => {
    const agrupado: Record<number, RES_ActivoFijoDisponible[]> = {};
    activosFijos.forEach((a) => {
      if (!agrupado[a.id_producto]) agrupado[a.id_producto] = [];
      agrupado[a.id_producto].push(a);
    });
    return agrupado;
  }, [activosFijos]);

  return {
    loading,
    selectedDetalles,
    detallesActivoFijo,
    lotesPorProducto,
    activosFijosPorProducto,
    entregaCantidades,
    entregaCantidadesActivos,
    empleados,
    idEmpleadoRecibe,
    setIdEmpleadoRecibe,
    observacion,
    setObservacion,
    evidencias,
    setEvidencias,
    error,
    isProcessing,
    totalEntregaGeneralBase,
    handleCantChange,
    handleCantLoteChange,
    handleCantActivoChange,
    handleConfirmar,
  };
};
