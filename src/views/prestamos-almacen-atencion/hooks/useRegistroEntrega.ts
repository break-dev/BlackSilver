import { useState, useCallback } from "react";
import { PrestamosAtencionService } from "../service/prestamos-atencion.service";
import type {
  RES_DetallePrestamoPorId,
  RES_LoteDisponibleDespacho,
  RES_EmpleadoPrestamo,
  RES_DetallePrestamo,
} from "../service/prestamos-atencion.responses";
import type { DTO_DetalleDespacho } from "../service/prestamos-atencion.requests";
import { useNotify } from "../../../hooks/useNotify";

export const useRegistroEntrega = (idAlmacenPrestamista: number) => {
  const { notifySuccess, notifyError } = useNotify();

  const [detallePrestamo, setDetallePrestamo] = useState<RES_DetallePrestamoPorId | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [empleados, setEmpleados] = useState<RES_EmpleadoPrestamo[]>([]);
  const [lotesDisponibles, setLotesDisponibles] = useState<Record<number, RES_LoteDisponibleDespacho[]>>({});
  const [loadingLotes, setLoadingLotes] = useState<Record<number, boolean>>({});

  const [idEmpleadoRecibe, setIdEmpleadoRecibe] = useState<string | null>(null);
  const [fechaEntrega, setFechaEntrega] = useState<Date | null>(new Date());
  const [observacion, setObservacion] = useState("");
  
  // Guardamos: id_lote_salida, cantidad_lote, cantidad_base
  const [seleccionLotes, setSeleccionLotes] = useState<Record<number, { 
    id_lote_salida: number; 
    cantidad_lote: number; 
    cantidad_base: number;
  }>>({});
  
  const [submitting, setSubmitting] = useState(false);

  // --------------------------------------------------
  // Cargar detalle + empleados al abrir el modal
  // --------------------------------------------------
  const cargarDetallePrestamo = useCallback(async (idPrestamo: number) => {
    setLoadingDetalle(true);
    setDetallePrestamo(null);
    setSeleccionLotes({});
    try {
      const [resDetalle, resEmpleados] = await Promise.all([
        PrestamosAtencionService.obtenerDetallePrestamo(idPrestamo),
        PrestamosAtencionService.obtenerEmpleados(),
      ]);
      if (resDetalle.success) setDetallePrestamo(resDetalle.data);
      if (resEmpleados.success) setEmpleados(resEmpleados.data);
    } catch {
      notifyError("Error al cargar el detalle del préstamo");
    } finally {
      setLoadingDetalle(false);
    }
  }, [notifyError]);

  // --------------------------------------------------
  // Cargar lotes disponibles para un producto
  // --------------------------------------------------
  const cargarLotesProducto = useCallback(async (idProducto: number, idDetallePrestamo: number) => {
    setLoadingLotes((prev) => ({ ...prev, [idDetallePrestamo]: true }));
    try {
      const res = await PrestamosAtencionService.obtenerLotesDisponibles(idProducto, idAlmacenPrestamista);
      if (res.success) {
        setLotesDisponibles((prev) => ({ ...prev, [idDetallePrestamo]: res.data }));
      }
    } catch {
      // silencioso
    } finally {
      setLoadingLotes((prev) => ({ ...prev, [idDetallePrestamo]: false }));
    }
  }, [idAlmacenPrestamista]);

  // --------------------------------------------------
  // Seleccionar lote para un ítem del préstamo
  // --------------------------------------------------
  const seleccionarLote = useCallback(
    (idDetallePrestamo: number, idLote: number, cantidad: number, ratioLote: number) => {
      setSeleccionLotes((prev) => ({
        ...prev,
        [idDetallePrestamo]: {
          id_lote_salida: idLote,
          cantidad_lote: cantidad,
          cantidad_base: cantidad * ratioLote,
        },
      }));
    },
    []
  );

  const setCantidadDespacho = useCallback(
    (idDetallePrestamo: number, cantidad: number, ratioLote: number) => {
      setSeleccionLotes((prev) => {
        const existing = prev[idDetallePrestamo];
        if (!existing) return prev;
        return {
          ...prev,
          [idDetallePrestamo]: {
            ...existing,
            cantidad_lote: cantidad,
            cantidad_base: cantidad * ratioLote,
          },
        };
      });
    },
    []
  );

  // --------------------------------------------------
  // Registrar el despacho
  // --------------------------------------------------
  const registrarDespacho = useCallback(
    async (idPrestamo: number, onSuccess: () => void) => {
      if (!idEmpleadoRecibe || !fechaEntrega) {
        notifyError("Seleccione el receptor y la fecha de entrega");
        return;
      }

      if (!detallePrestamo) return;

      const itemsADespachar: DTO_DetalleDespacho[] = Object.entries(seleccionLotes).map(
        ([idDetalle, sel]) => {
          const det = (detallePrestamo.detalles as RES_DetallePrestamo[]).find(d => d.id_prestamo_detalle === Number(idDetalle));
          const ratioItem = det?.contenido_por_presentacion || 1;
          
          return {
            id_prestamo_detalle: Number(idDetalle),
            id_lote_salida: sel.id_lote_salida,
            cantidad_lote: sel.cantidad_lote,
            cantidad_base: sel.cantidad_base,
            // Convertimos la base a la unidad de la solicitud original
            cantidad_solicitud: sel.cantidad_base / ratioItem
          };
        }
      );

      if (itemsADespachar.length === 0) {
        notifyError("Seleccione al menos un lote para despachar");
        return;
      }

      setSubmitting(true);
      try {
        const res = await PrestamosAtencionService.registrarDespacho({
          id_prestamo: idPrestamo,
          id_empleado_recibe: Number(idEmpleadoRecibe),
          fecha_hora_entrega: fechaEntrega.toISOString(),
          observacion: observacion || undefined,
          detalles: itemsADespachar,
        });

        if (res.success) {
          notifySuccess(`Despacho registrado correctamente`);
          onSuccess();
        } else {
          notifyError(res.message || "Error al registrar el despacho");
        }
      } catch {
        notifyError("Error de conexión");
      } finally {
        setSubmitting(false);
      }
    },
    [idEmpleadoRecibe, fechaEntrega, observacion, seleccionLotes, detallePrestamo, notifySuccess, notifyError]
  );

  return {
    detallePrestamo,
    loadingDetalle,
    empleados,
    lotesDisponibles,
    loadingLotes,
    idEmpleadoRecibe,
    setIdEmpleadoRecibe,
    fechaEntrega,
    setFechaEntrega,
    observacion,
    setObservacion,
    seleccionLotes,
    submitting,
    cargarDetallePrestamo,
    cargarLotesProducto,
    seleccionarLote,
    setCantidadDespacho,
    registrarDespacho,
  };
};
