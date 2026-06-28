import { useState, useEffect, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import { SolicitudesAtencionService } from "../service/solicitudes-atencion.service";
import type { DetalleSolicitudExtendido } from "../service/solicitudes-atencion.responses";
import type { DTO_EntregasDetalleReabastecimiento } from "../service/solicitudes-atencion.requests";
import { useAuthUser } from "../../../hooks/useAuthUser";
import { useNotify } from "../../../hooks/useNotify";
import type { RES_LoteDisponible } from "../../../service/responses/lote-producto";
import type { RES_Empleado } from "../../../service/responses/empleado";
import type { RES_Almacen } from "../../../service/responses/almacen";
import type { RES_SolicitudDetalle } from "../../../service/responses/solicitudes-reabastecimiento/solicitud";
import type { RES_ActivoFijoDisponible } from "../../../service/responses/activo-fijo";
import { AuxService } from "../../../service/auxiliar.service";
import { TipoBien } from "../../../shared/enums/_generic/tipo-bien";

import { type TransporteData } from "../../../presentation/utils/transport/transporte-fields";
import { MedioEntrega } from "../../../shared/enums/_generic/medio-entrega";

interface UseRegistroEntregaProps {
  idSolicitud: number;
  idEmpleadoSolicitante: number;
  selectedDetalles: RES_SolicitudDetalle[];
  onSuccess: () => void;
}

interface DetalleExt extends DetalleSolicitudExtendido {
  equivSolicitud: number;
}

export const useRegistroEntrega = ({
  idSolicitud,
  idEmpleadoSolicitante,
  selectedDetalles: baseDetalles,
  onSuccess,
}: UseRegistroEntregaProps) => {
  const { usuario } = useAuthUser();
  const loggedEmployeeId = usuario?.id_empleado;
  const { notifySuccess } = useNotify();

  const [loadingAlmacenes, setLoadingAlmacenes] = useState(true);
  const [loadingLotes, setLoadingLotes] = useState(false);

  const [almacenesPrincipales, setAlmacenesPrincipales] = useState<
    RES_Almacen[]
  >([]);
  const [empleados, setEmpleados] = useState<RES_Empleado[]>([]);
  const [loadingPersonal, setLoadingPersonal] = useState(false);

  useEffect(() => {
    const loadEmpleados = async () => {
      setLoadingPersonal(true);
      try {
        const res = await AuxService.get_empleados();
        if (res.success && res.data) {
          setEmpleados(res.data);
        }
      } catch (err) {
        console.error("Error loading employees", err);
      } finally {
        setLoadingPersonal(false);
      }
    };
    loadEmpleados();
  }, []);

  const personal = useMemo(() => {
    return empleados.map((e) => ({
      value: String(e.id_empleado),
      label: e.nombre_completo,
    }));
  }, [empleados]);
  const [lotes, setLotes] = useState<RES_LoteDisponible[]>([]);
  const [activosFijos, setActivosFijos] = useState<RES_ActivoFijoDisponible[]>(
    [],
  );

  const [idAlmacenEntrega, setIdAlmacenEntrega] = useState<string | null>(null);
  const [transporte, setTransporte] = useState<TransporteData>({
    medio_entrega: null,
    id_proveedor_transporte: null,
    id_agencia_transporte: null,
    id_empleado_recibe: null,
    numero_factura: "",
    serie_factura: "",
    serie_guia_transportista: "",
    numero_guia_transportista: "",
    serie_guia_remitente: "",
    numero_guia_remitente: "",
    costo_envio: "",
  });

  const onChangeTransporte = useCallback((field: keyof TransporteData, value: any) => {
    setTransporte((prev) => ({ ...prev, [field]: value }));
  }, []);
  const [observacion, setObservacion] = useState("");
  const [evidencias, setEvidencias] = useState<File[]>([]);
  const [entregaCantidades, setEntregaCantidades] = useState<
    Record<number, Record<number, number>>
  >({});
  const [entregaCantidadesActivos, setEntregaCantidadesActivos] = useState<
    Record<number, Record<number, number>>
  >({});

  const [errorLocal, setErrorLocal] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedDetalles = useMemo<DetalleExt[]>(() => {
    return baseDetalles.map((d) => ({
      ...d,
      pendiente_base:
        Number(d.cantidad_solicitada_base) -
        (Number(d.cantidad_entregada_base) +
          Number(d.cantidad_prestada_total_base || 0)),
      equivSolicitud:
        d.cantidad_solicitada > 0
          ? d.cantidad_solicitada_base / d.cantidad_solicitada
          : 1,
    }));
  }, [baseDetalles]);

  const detallesConLote = useMemo(
    () => selectedDetalles.filter((d) => d.tipo_bien !== TipoBien.ActivoFijo),
    [selectedDetalles],
  );

  const detallesActivoFijo = useMemo(
    () => selectedDetalles.filter((d) => d.tipo_bien === TipoBien.ActivoFijo),
    [selectedDetalles],
  );

  const idsProductos = useMemo(() => {
    return Array.from(new Set(detallesConLote.map((d) => d.id_producto)));
  }, [detallesConLote]);

  const idsActivoFijo = useMemo(() => {
    return Array.from(new Set(detallesActivoFijo.map((d) => d.id_producto)));
  }, [detallesActivoFijo]);

  useEffect(() => {
    const loadAlmacenes = async () => {
      setLoadingAlmacenes(true);
      try {
        const resAlm = await AuxService.get_almacenes({ es_principal: true });
        if (resAlm.success) {
          setAlmacenesPrincipales(resAlm.data);
          if (resAlm.data.length > 0 && !idAlmacenEntrega) {
            setIdAlmacenEntrega(String(resAlm.data[0].id_almacen));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAlmacenes(false);
      }
    };

    loadAlmacenes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedEmployeeId, idEmpleadoSolicitante]);

  useEffect(() => {
    if (
      idAlmacenEntrega &&
      (idsProductos.length > 0 || idsActivoFijo.length > 0)
    ) {
      const loadLotesYActivos = async () => {
        setLoadingLotes(true);
        try {
          const [resLotes, resActivos] = await Promise.all([
            idsProductos.length > 0
              ? AuxService.get_lotes_disponibles(
                  Number(idAlmacenEntrega),
                  idsProductos,
                )
              : Promise.resolve({ success: true, data: [] }),
            idsActivoFijo.length > 0
              ? AuxService.get_activos_disponibles({
                  id_almacen: Number(idAlmacenEntrega),
                  ids_productos: idsActivoFijo,
                })
              : Promise.resolve({ success: true, data: [] }),
          ]);

          if (resLotes.success) {
            setLotes(resLotes.data);
            const initial: Record<number, Record<number, number>> = {};
            detallesConLote.forEach((det) => {
              initial[det.id_solicitud_detalle] = {};
              resLotes.data
                .filter((l) => l.id_producto === det.id_producto)
                .forEach((l) => {
                  initial[det.id_solicitud_detalle][l.id_lote] = 0;
                });
            });
            setEntregaCantidades(initial);
          }

          if (resActivos.success) {
            setActivosFijos(resActivos.data);
            const initialActivos: Record<number, Record<number, number>> = {};
            detallesActivoFijo.forEach((det) => {
              initialActivos[det.id_solicitud_detalle] = {};
              resActivos.data
                .filter((a) => a.id_producto === det.id_producto)
                .forEach((a) => {
                  initialActivos[det.id_solicitud_detalle][a.id_activo] = 0;
                });
            });
            setEntregaCantidadesActivos(initialActivos);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingLotes(false);
        }
      };
      loadLotesYActivos();
    } else {
      setLotes([]);
      setActivosFijos([]);
      setEntregaCantidades({});
      setEntregaCantidadesActivos({});
    }
  }, [
    idAlmacenEntrega,
    idsProductos,
    idsActivoFijo,
    detallesConLote,
    detallesActivoFijo,
  ]);

  const handleCantChange = useCallback(
    (idSolicitudDetalle: number, idLote: number, val: number) => {
      const lote = lotes.find((l) => l.id_lote === idLote);
      const detalle = selectedDetalles.find(
        (d) => d.id_solicitud_detalle === idSolicitudDetalle,
      );
      if (!lote || !detalle) return;

      const currentDetalleCantidades =
        entregaCantidades[idSolicitudDetalle] || {};
      const currentTotalParaDetalle = Object.entries(currentDetalleCantidades)
        .filter(([idL]) => Number(idL) !== idLote)
        .reduce((sum, [, cant]) => sum + cant, 0);

      // Suma de lo entregado en OTROS detalles para ESTE LOTE
      const totalEnOtrosDetallesParaEsteLote = Object.entries(entregaCantidades)
        .filter(([idDet]) => Number(idDet) !== idSolicitudDetalle)
        .reduce((sum, [, lotesMap]) => sum + (lotesMap[idLote] || 0), 0);

      // El stock máximo es el del lote (menos lo que otros detalles ya tomaron),
      // pero limitado por lo pendiente del detalle actual
      const stockDisponibleRealLote = Math.max(
        0,
        lote.stock_actual_base - totalEnOtrosDetallesParaEsteLote,
      );

      const maxAllowed = Math.min(
        stockDisponibleRealLote,
        detalle.pendiente_base - currentTotalParaDetalle,
      );

      const newValue = Math.max(0, Math.min(val, maxAllowed));

      setEntregaCantidades((prev) => ({
        ...prev,
        [idSolicitudDetalle]: {
          ...(prev[idSolicitudDetalle] || {}),
          [idLote]: newValue,
        },
      }));
    },
    [lotes, selectedDetalles, entregaCantidades],
  );

  const handleCantLoteChange = useCallback(
    (idSolicitudDetalle: number, idLote: number, val: number) => {
      const lote = lotes.find((l) => l.id_lote === idLote);
      if (!lote) return;

      const newBaseValue = val * (lote.contenido_por_presentacion || 1);
      handleCantChange(idSolicitudDetalle, idLote, newBaseValue);
    },
    [lotes, handleCantChange],
  );

  const handleCantActivoChange = useCallback(
    (idSolicitudDetalle: number, idActivo: number, val: number) => {
      setEntregaCantidadesActivos((prev) => {
        const finalValue = Math.max(0, Math.min(val, 1));
        const prevCantidades = prev[idSolicitudDetalle] || {};

        const detail = selectedDetalles.find(
          (d) => d.id_solicitud_detalle === idSolicitudDetalle,
        );
        if (!detail) return prev;

        const totalOther = Object.entries(prevCantidades).reduce(
          (sum, [aId, v]) => {
            if (Number(aId) === idActivo) return sum;
            return sum + (v || 0);
          },
          0,
        );

        const pendienteMaxDetalle = detail.pendiente_base;

        const maxAllowed = Math.max(
          0,
          Math.min(1, pendienteMaxDetalle - totalOther),
        );
        const safeValue = Math.max(0, Math.min(finalValue, maxAllowed));

        if (prevCantidades[idActivo] === safeValue) return prev;

        return {
          ...prev,
          [idSolicitudDetalle]: {
            ...prevCantidades,
            [idActivo]: safeValue,
          },
        };
      });
    },
    [selectedDetalles],
  );

  const lotesPorProducto = useMemo(() => {
    const acc: Record<number, RES_LoteDisponible[]> = {};
    lotes.forEach((l) => {
      if (!acc[l.id_producto]) acc[l.id_producto] = [];
      acc[l.id_producto].push(l);
    });
    return acc;
  }, [lotes]);
  const handleConfirmar = async () => {
    if (!idAlmacenEntrega || !transporte.medio_entrega) {
      setErrorLocal("Complete todos los campos obligatorios");
      return;
    }

    if (transporte.medio_entrega === MedioEntrega.Propio && !transporte.id_empleado_recibe) {
      setErrorLocal("Debe seleccionar el chofer/encargado");
      return;
    }
    if (transporte.medio_entrega === MedioEntrega.Terceros) {
      if (
        !transporte.id_proveedor_transporte ||
        !transporte.serie_factura ||
        !transporte.numero_factura ||
        !transporte.serie_guia_remitente ||
        !transporte.numero_guia_remitente ||
        !transporte.serie_guia_transportista ||
        !transporte.numero_guia_transportista ||
        !transporte.costo_envio
      ) {
        setErrorLocal("Complete todos los campos de transporte obligatorios");
        return;
      }
    }
    if (transporte.medio_entrega === MedioEntrega.Agencia) {
      if (
        !transporte.id_agencia_transporte ||
        !transporte.serie_factura ||
        !transporte.numero_factura ||
        !transporte.serie_guia_transportista ||
        !transporte.numero_guia_transportista
      ) {
        setErrorLocal("Complete todos los campos de la agencia obligatorios");
        return;
      }
    }

    const detallesApi: DTO_EntregasDetalleReabastecimiento[] = [];

    // --- Activos Fijos: Selección de Activos ---
    Object.entries(entregaCantidadesActivos).forEach(([idDet, activosMap]) => {
      const idSolicitudDetalle = Number(idDet);
      Object.entries(activosMap).forEach(([idA, cant]) => {
        if (cant > 0) {
          detallesApi.push({
            id_solicitud_detalle: idSolicitudDetalle,
            id_activo_fijo: Number(idA),
            cantidad_base: 1,
            cantidad_lote: 1,
            cantidad_solicitud: 1,
          });
        }
      });
    });

    // --- Lotes Comunes ---
    Object.entries(entregaCantidades).forEach(([idDet, lotesCants]) => {
      const idSolicitudDetalle = Number(idDet);
      const detalle = selectedDetalles.find(
        (d) => d.id_solicitud_detalle === idSolicitudDetalle,
      );

      if (!detalle) return;

      Object.entries(lotesCants).forEach(([idL, cant]) => {
        if (cant > 0) {
          const idLote = Number(idL);
          const lote = lotes.find((l) => l.id_lote === idLote);
          if (lote) {
            detallesApi.push({
              id_solicitud_detalle: idSolicitudDetalle,
              id_lote_producto: idLote,
              cantidad_base: cant,
              cantidad_lote: cant / (lote.contenido_por_presentacion || 1),
              cantidad_solicitud: cant / (detalle.equivSolicitud || 1),
            });
          }
        }
      });
    });

    if (detallesApi.length === 0) {
      setErrorLocal("Debe entregar al menos un producto");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await SolicitudesAtencionService.registrarEntrega({
        id_solicitud: idSolicitud,
        id_almacen_entrega: Number(idAlmacenEntrega),
        id_empleado_recibe: transporte.medio_entrega === MedioEntrega.Propio ? Number(transporte.id_empleado_recibe) : null,
        fecha_hora_entrega: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        observacion,
        evidencias,
        detalles: detallesApi,
        // Transport fields
        medio_entrega: transporte.medio_entrega,
        id_proveedor_transporte: transporte.id_proveedor_transporte ? Number(transporte.id_proveedor_transporte) : null,
        id_agencia_transporte: transporte.id_agencia_transporte ? Number(transporte.id_agencia_transporte) : null,
        numero_factura: transporte.numero_factura || null,
        serie_factura: transporte.serie_factura || null,
        serie_guia_transportista: transporte.serie_guia_transportista || null,
        numero_guia_transportista: transporte.numero_guia_transportista || null,
        serie_guia_remitente: transporte.serie_guia_remitente || null,
        numero_guia_remitente: transporte.numero_guia_remitente || null,
        costo_envio: transporte.costo_envio ? Number(transporte.costo_envio) : null,
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
    loadingAlmacenes,
    loadingPersonal,
    loadingLotes,
    almacenesPrincipales,
    personal,
    lotesPorProducto,
    activosFijos,
    idAlmacenEntrega,
    setIdAlmacenEntrega,
    transporte,
    onChangeTransporte,

    observacion,
    setObservacion,
    evidencias,
    setEvidencias,
    entregaCantidades,
    entregaCantidadesActivos,
    handleCantChange,
    handleCantLoteChange,
    handleCantActivoChange,
    handleConfirmar,
    isProcessing,
    errorLocal,
    selectedDetalles,
  };
};
