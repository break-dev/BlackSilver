import { useState, useCallback, useMemo } from "react";
import { PrestamosAtencionService } from "../service/prestamos-atencion.service";
import type {
  RES_Lote_Atencion,
  RES_EmpleadoPrestamo,
  RES_DetallePrestamo,
  RES_LoteDisponibleDespacho,
} from "../service/prestamos-atencion.responses";
import type { DTO_DetalleEntrega } from "../service/prestamos-atencion.requests";
import { useNotify } from "../../../hooks/useNotify";

interface UseRegistroEntregaProps {
  idAlmacenPrestamista: number;
  selectedItemsIds: number[];
  detallesPrestamo: RES_DetallePrestamo[];
  onSuccess: () => void;
}

export const useRegistroEntrega = ({
  idAlmacenPrestamista,
  selectedItemsIds,
  detallesPrestamo,
  onSuccess,
}: UseRegistroEntregaProps) => {
  const { notifySuccess, notifyError } = useNotify();

  const [loading, setLoading] = useState(false);
  const [empleados, setEmpleados] = useState<{ value: string; label: string }[]>([]);
  const [lotes, setLotes] = useState<RES_Lote_Atencion[]>([]);

  const [idEmpleadoRecibe, setIdEmpleadoRecibe] = useState<string | null>(null);
  const [observacion, setObservacion] = useState("");
  
  // Guardamos: idDetalle -> idLote -> cantidad_base
  const [entregaCantidades, setEntregaCantidades] = useState<Record<number, Record<number, number>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const itemsAEntregar = useMemo(() => {
    return detallesPrestamo.filter(d => selectedItemsIds.includes(d.id_prestamo_detalle));
  }, [detallesPrestamo, selectedItemsIds]);

  const idsProductos = useMemo(() => {
    return Array.from(new Set(itemsAEntregar.map(d => d.id_producto)));
  }, [itemsAEntregar]);

  // Cargar Empleados y Lotes iniciales
  const cargarDatosIniciales = useCallback(async () => {
    if (idsProductos.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const [resEmps, resLotes] = await Promise.all([
        PrestamosAtencionService.obtenerEmpleados(),
        PrestamosAtencionService.obtenerLotesDisponiblesBatch(idsProductos, idAlmacenPrestamista),
      ]);

      if (resEmps.success) {
        setEmpleados(resEmps.data.map((e: RES_EmpleadoPrestamo) => ({
          value: String(e.id_empleado),
          label: `${e.nombre_completo} - ${e.dni}`
        })));
      }

      if (resLotes.success) {
        const castedLotes: RES_Lote_Atencion[] = resLotes.data.map((l: RES_LoteDisponibleDespacho) => ({
          ...l,
          stock_actual: Number(l.stock_actual),
          stock_actual_base: Number(l.stock_actual_base),
          contenido_por_presentacion: Number(l.contenido_por_presentacion)
        }));
        setLotes(castedLotes);

        // Inicializar cantidades
        const initial: Record<number, Record<number, number>> = {};
        itemsAEntregar.forEach(d => {
          initial[d.id_prestamo_detalle] = {};
          castedLotes.filter((l: RES_Lote_Atencion) => l.id_producto === d.id_producto).forEach((l: RES_Lote_Atencion) => {
            initial[d.id_prestamo_detalle][l.id_lote] = 0;
          });
        });
        setEntregaCantidades(initial);
      }
    } catch {
      setError("Error al cargar datos necesarios");
    } finally {
      setLoading(false);
    }
  }, [idsProductos, idAlmacenPrestamista, itemsAEntregar]);

  const handleCantLoteChange = useCallback((idDetalle: number, idLote: number, valLote: number) => {
    setEntregaCantidades(prev => {
      const lote = lotes.find(l => l.id_lote === idLote);
      if (!lote) return prev;

      const detail = itemsAEntregar.find(d => d.id_prestamo_detalle === idDetalle);
      if (!detail) return prev;

      const equiv = lote.contenido_por_presentacion || 1;
      const valBase = Number((valLote * equiv).toFixed(4));

      // Validar contra el pendiente del item
      const pendienteBase = detail.cantidad_solicitada_base - detail.cantidad_prestada_base;
      
      // Suma de otros lotes para este mismo item
      const otrosLotesSum = Object.entries(prev[idDetalle] || {}).reduce((acc, [lId, v]) => {
        return Number(lId) === idLote ? acc : acc + (v || 0);
      }, 0);

      // Suma de este mismo lote para otros items (si los hubiera, aunque en prestamos suelen ser 1 item por producto)
      const otrosItemsSum = Object.entries(prev).reduce((acc, [dId, lotesMap]) => {
        return Number(dId) === idDetalle ? acc : acc + (lotesMap[idLote] || 0);
      }, 0);

      const disponibleEnLote = lote.stock_actual_base - otrosItemsSum;
      const maxPermitido = Math.min(disponibleEnLote, pendienteBase - otrosLotesSum);
      
      const finalValBase = Math.max(0, Math.min(valBase, maxPermitido));

      return {
        ...prev,
        [idDetalle]: {
          ...(prev[idDetalle] || {}),
          [idLote]: finalValBase
        }
      };
    });
  }, [lotes, itemsAEntregar]);

  const totalEntregaGeneralBase = useMemo(() => {
    let total = 0;
    Object.values(entregaCantidades).forEach(lotesMap => {
      Object.values(lotesMap).forEach(v => total += (v || 0));
    });
    return total;
  }, [entregaCantidades]);

  const registrarEntrega = useCallback(async (idPrestamo: number) => {
    if (!idEmpleadoRecibe) {
      notifyError("Debe seleccionar el receptor");
      return;
    }

    const detallesParaApi: DTO_DetalleEntrega[] = [];
    Object.entries(entregaCantidades).forEach(([idDet, lotesMap]) => {
      const idDetalle = Number(idDet);
      const detail = itemsAEntregar.find(d => d.id_prestamo_detalle === idDetalle);
      if (!detail) return;

      Object.entries(lotesMap).forEach(([idLot, cantBase]) => {
        if (cantBase > 0) {
          const numIdLote = Number(idLot);
          const lote = lotes.find(l => l.id_lote === numIdLote);
          if (!lote) return;

          const ratioItem = detail.contenido_por_presentacion || 1;
          const ratioLote = lote.contenido_por_presentacion || 1;

          detallesParaApi.push({
            id_prestamo_detalle: idDetalle,
            id_lote_salida: numIdLote,
            cantidad_base: cantBase,
            cantidad_lote: cantBase / ratioLote,
            cantidad_solicitud: cantBase / ratioItem
          });
        }
      });
    });

    if (detallesParaApi.length === 0) {
      notifyError("Seleccione al menos un lote para entregar");
      return;
    }

    setSubmitting(true);
    try {
      const res = await PrestamosAtencionService.registrarEntrega({
        id_prestamo: idPrestamo,
        id_empleado_recibe: Number(idEmpleadoRecibe),
        fecha_hora_entrega: undefined, // Backend usará now()
        observacion: observacion || undefined,
        detalles: detallesParaApi
      });

      if (res.success) {
        notifySuccess("Entrega registrada correctamente");
        onSuccess();
      } else {
        notifyError(res.message || "Error al registrar la entrega");
      }
    } catch {
      notifyError("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  }, [idEmpleadoRecibe, entregaCantidades, itemsAEntregar, lotes, observacion, onSuccess, notifyError, notifySuccess]);

  return {
    loading,
    itemsAEntregar,
    lotes,
    entregaCantidades,
    empleados,
    idEmpleadoRecibe,
    setIdEmpleadoRecibe,
    observacion,
    setObservacion,
    submitting,
    error,
    totalEntregaGeneralBase,
    cargarDatosIniciales,
    handleCantLoteChange,
    registrarEntrega
  };
};
