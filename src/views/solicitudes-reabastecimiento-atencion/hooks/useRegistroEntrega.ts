import { useState, useEffect, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import { SolicitudesAtencionService } from "../service/solicitudes-atencion.service";
import type {
  RES_DetalleSolicitud,
  RES_LoteReabastecimiento,
  RES_Empleado,
  RES_Almacen,
  DetalleSolicitudExtendido,
} from "../service/solicitudes-atencion.responses";
import type { DTO_EntregasDetalleReabastecimiento } from "../service/solicitudes-atencion.requests";
import { useAuthUser } from "../../../hooks/useAuthUser";
import { useNotify } from "../../../hooks/useNotify";

interface UseRegistroEntregaProps {
  idSolicitud: number;
  selectedDetalles: RES_DetalleSolicitud[];
  onSuccess: () => void;
}

interface DetalleExt extends DetalleSolicitudExtendido {
  equivSolicitud: number;
}

export const useRegistroEntrega = ({
  idSolicitud,
  selectedDetalles: baseDetalles,
  onSuccess,
}: UseRegistroEntregaProps) => {
  const authUser = useAuthUser();
  const loggedEmployeeId = authUser?.id_empleado;
  const { notifySuccess } = useNotify();

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingLotes, setLoadingLotes] = useState(false);

  const [almacenesPrincipales, setAlmacenesPrincipales] = useState<
    RES_Almacen[]
  >([]);
  const [empleados, setEmpleados] = useState<RES_Empleado[]>([]);
  const [lotes, setLotes] = useState<RES_LoteReabastecimiento[]>([]);

  const [idAlmacenEntrega, setIdAlmacenEntrega] = useState<string | null>(null);
  const [idEmpleadoRecibe, setIdEmpleadoRecibe] = useState<string | null>(null);
  const [observacion, setObservacion] = useState("");
  const [entregaCantidades, setEntregaCantidades] = useState<
    Record<number, number>
  >({});

  const [errorLocal, setErrorLocal] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedDetalles = useMemo<DetalleExt[]>(() => {
    return baseDetalles.map((d) => ({
      ...d,
      pendiente_base: d.cantidad_solicitada_base - d.cantidad_entregada_base,
      equivSolicitud:
        d.cantidad_solicitada > 0
          ? d.cantidad_solicitada_base / d.cantidad_solicitada
          : 1,
    }));
  }, [baseDetalles]);

  const idsProductos = useMemo(() => {
    return Array.from(new Set(selectedDetalles.map((d) => d.id_producto)));
  }, [selectedDetalles]);

  useEffect(() => {
    const loadInitial = async () => {
      setLoadingInitial(true);
      try {
        const [resAlm, resEmp] = await Promise.all([
          SolicitudesAtencionService.obtenerAlmacenes(true),
          SolicitudesAtencionService.obtenerEmpleados(),
        ]);
        if (resAlm.success) setAlmacenesPrincipales(resAlm.data);
        if (resEmp.success) {
          setEmpleados(resEmp.data.filter((e) => e.id !== loggedEmployeeId));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingInitial(false);
      }
    };
    loadInitial();
  }, [loggedEmployeeId]);

  useEffect(() => {
    if (idAlmacenEntrega && idsProductos.length > 0) {
      const loadLotes = async () => {
        setLoadingLotes(true);
        try {
          const res = await SolicitudesAtencionService.obtenerLotesDisponibles(
            idsProductos,
            Number(idAlmacenEntrega),
          );
          if (res.success) {
            setLotes(res.data);
            const initial: Record<number, number> = {};
            res.data.forEach((l) => (initial[l.id_lote] = 0));
            setEntregaCantidades(initial);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingLotes(false);
        }
      };
      loadLotes();
    } else {
      setLotes([]);
      setEntregaCantidades({});
    }
  }, [idAlmacenEntrega, idsProductos]);

  const handleCantChange = useCallback(
    (idLote: number, idProducto: number, val: number) => {
      const lote = lotes.find((l) => l.id_lote === idLote);
      const detalle = selectedDetalles.find(
        (d) => d.id_producto === idProducto,
      );
      if (!lote || !detalle) return;

      const currentTotalParaProducto = lotes
        .filter((l) => l.id_producto === idProducto && l.id_lote !== idLote)
        .reduce((sum, l) => sum + (entregaCantidades[l.id_lote] || 0), 0);

      const maxAllowed = Math.min(
        lote.stock_actual_base,
        detalle.pendiente_base - currentTotalParaProducto,
      );

      const newValue = Math.max(0, Math.min(val, maxAllowed));
      setEntregaCantidades((prev) => ({ ...prev, [idLote]: newValue }));
    },
    [lotes, selectedDetalles, entregaCantidades],
  );

  const lotesPorProducto = useMemo(() => {
    const acc: Record<number, RES_LoteReabastecimiento[]> = {};
    lotes.forEach((l) => {
      if (!acc[l.id_producto]) acc[l.id_producto] = [];
      acc[l.id_producto].push(l);
    });
    return acc;
  }, [lotes]);

  const handleConfirmar = async () => {
    if (!idAlmacenEntrega || !idEmpleadoRecibe) {
      setErrorLocal("Complete todos los campos obligatorios");
      return;
    }

    const detallesApi: DTO_EntregasDetalleReabastecimiento[] = [];
    for (const [idL, cant] of Object.entries(entregaCantidades)) {
      if (cant > 0) {
        const idLote = Number(idL);
        const lote = lotes.find((l) => l.id_lote === idLote);
        const detalle = selectedDetalles.find(
          (d) => d.id_producto === lote?.id_producto,
        );
        if (lote && detalle) {
          detallesApi.push({
            id_solicitud_detalle: detalle.id_solicitud_detalle,
            id_lote_producto: idLote,
            cantidad_base: cant,
            cantidad_lote: cant / (lote.contenido_por_presentacion || 1),
            cantidad_solicitud: cant / (detalle.equivSolicitud || 1),
          });
        }
      }
    }

    if (detallesApi.length === 0) {
      setErrorLocal("Debe entregar al menos un producto");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await SolicitudesAtencionService.registrarEntrega({
        id_solicitud: idSolicitud,
        id_almacen_entrega: Number(idAlmacenEntrega),
        id_empleado_recibe: Number(idEmpleadoRecibe),
        fecha_hora_entrega: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        observacion,
        detalles: detallesApi,
      });

      if (res.success) {
        notifySuccess(`Entrega N° ${res.data} registrada correctamente`);
        onSuccess();
      } else {
        setErrorLocal(res.message);
      }
    } catch (err) {
      console.error(err);
      setErrorLocal("Error al registrar la entrega");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    loadingInitial,
    loadingLotes,
    almacenesPrincipales,
    empleados,
    lotesPorProducto,
    idAlmacenEntrega,
    setIdAlmacenEntrega,
    idEmpleadoRecibe,
    setIdEmpleadoRecibe,
    observacion,
    setObservacion,
    entregaCantidades,
    handleCantChange,
    handleConfirmar,
    isProcessing,
    errorLocal,
    selectedDetalles,
  };
};
