import { useState, useCallback } from "react";
import { PrestamosAtencionService } from "../service/prestamos-atencion.service";
import type {
  RES_DetallePrestamoPorId,
  RES_LoteDisponibleDespacho,
  RES_EmpleadoPrestamo,
} from "../service/prestamos-atencion.responses";
import type { DTO_DetalleDespacho } from "../service/prestamos-atencion.requests";
import { useNotify } from "../../../hooks/useNotify";

export const useDespacharPrestamo = (idAlmacenPrestamista: number) => {
  const { notifySuccess, notifyError } = useNotify();

  // -- Datos del préstamo seleccionado --
  const [detallePrestamo, setDetallePrestamo] = useState<RES_DetallePrestamoPorId | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // -- Catálogos --
  const [empleados, setEmpleados] = useState<RES_EmpleadoPrestamo[]>([]);
  const [lotesDisponibles, setLotesDisponibles] = useState<Record<number, RES_LoteDisponibleDespacho[]>>({});
  const [loadingLotes, setLoadingLotes] = useState<Record<number, boolean>>({});

  // -- Form de despacho --
  const [idEmpleadoRecibe, setIdEmpleadoRecibe] = useState<string | null>(null);
  const [fechaEntrega, setFechaEntrega] = useState<Date | null>(new Date());
  const [observacion, setObservacion] = useState("");
  const [seleccionLotes, setSeleccionLotes] = useState<Record<number, { id_lote_salida: number; cantidad: number; cantidad_base: number }>>({});
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
    (idDetallePrestamo: number, idLote: number, cantidad: number, contenidoPorPresentacion: number) => {
      setSeleccionLotes((prev) => ({
        ...prev,
        [idDetallePrestamo]: {
          id_lote_salida: idLote,
          cantidad,
          cantidad_base: cantidad * contenidoPorPresentacion,
        },
      }));
    },
    []
  );

  const setCantidadDespacho = useCallback(
    (idDetallePrestamo: number, cantidad: number, contenidoPorPresentacion: number) => {
      setSeleccionLotes((prev) => {
        const existing = prev[idDetallePrestamo];
        if (!existing) return prev;
        return {
          ...prev,
          [idDetallePrestamo]: {
            ...existing,
            cantidad,
            cantidad_base: cantidad * contenidoPorPresentacion,
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

      const detalles: DTO_DetalleDespacho[] = Object.entries(seleccionLotes).map(
        ([idDetalle, sel]) => ({
          id_prestamo_detalle: Number(idDetalle),
          id_lote_salida: sel.id_lote_salida,
          cantidad: sel.cantidad,
          cantidad_base: sel.cantidad_base,
        })
      );

      if (detalles.length === 0) {
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
          detalles,
        });

        if (res.success) {
          notifySuccess(`Despacho ${res.data.correlativo} registrado exitosamente`);
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
    [idEmpleadoRecibe, fechaEntrega, observacion, seleccionLotes, notifySuccess, notifyError]
  );

  return {
    // estado
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
    // acciones
    cargarDetallePrestamo,
    cargarLotesProducto,
    seleccionarLote,
    setCantidadDespacho,
    registrarDespacho,
  };
};
