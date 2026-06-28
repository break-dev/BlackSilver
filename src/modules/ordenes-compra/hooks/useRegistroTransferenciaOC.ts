import { useState, useCallback, useMemo, useEffect } from "react";
import { OrdenCompraService } from "../service/orden-compra.service";
import type { RES_OrdenCompraRecepcionDetalle } from "../../../service/responses/ordenes-compra/orden-compra-recepcion";
import type { RES_LoteDisponible } from "../../../service/responses/lote-producto";
import type { RES_Empleado } from "../../../service/responses/empleado";
import type { RES_ActivoFijoDisponible } from "../../../service/responses/activo-fijo";
import { useAuthStore } from "../../../stores/auth.store";
import dayjs from "dayjs";
import { AuxService } from "../../../service/auxiliar.service";
import { TipoBien } from "../../../shared/enums/_generic/tipo-bien";
import { type TransporteData } from "../../../presentation/utils/transport/transporte-fields";
import { MedioEntrega } from "../../../shared/enums/_generic/medio-entrega";

export const useRegistroTransferenciaOC = ({
  idAlmacenRecepcionista,
  selectedItemsIds,
  detallesRecepcion,
  onSuccess,
}: {
  idAlmacenRecepcionista: number;
  selectedItemsIds: number[];
  detallesRecepcion: RES_OrdenCompraRecepcionDetalle[];
  onSuccess: (resumen?: Record<number, number>) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [lotes, setLotes] = useState<RES_LoteDisponible[]>([]);
  const [activosFijos, setActivosFijos] = useState<RES_ActivoFijoDisponible[]>(
    [],
  );
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // mapa de cant transferida por lote: { id_recepcion_detalle: { id_lote: cant_base } }
  const [transferenciaCantidades, setTransferenciaCantidades] = useState<
    Record<number, Record<number, number>>
  >({});

  // mapa de cant transferida por activo: { id_recepcion_detalle: { id_activo: cant_base } }
  const [transferenciaCantidadesActivos, setTransferenciaCantidadesActivos] =
    useState<Record<number, Record<number, number>>>({});

  const itemsATransferir = useMemo(() => {
    return detallesRecepcion.filter((d) =>
      selectedItemsIds.includes(d.id_recepcion_detalle),
    );
  }, [detallesRecepcion, selectedItemsIds]);

  const cargarDatosIniciales = useCallback(async () => {
    setLoading(true);
    try {
      const idsProductos = itemsATransferir.map((i) => i.id_producto);
      const activeAssetProductIds = itemsATransferir
        .filter((item) => item.tipo_bien === TipoBien.ActivoFijo)
        .map((item) => item.id_producto);

      const [lotesRes, activosRes] = await Promise.all([
        idsProductos.length > 0
          ? AuxService.get_lotes_disponibles(
              idAlmacenRecepcionista,
              idsProductos,
            )
          : Promise.resolve({
              success: true,
              data: [] as RES_LoteDisponible[],
            }),
        activeAssetProductIds.length > 0
          ? AuxService.get_activos_disponibles({
              id_almacen: idAlmacenRecepcionista,
              ids_productos: activeAssetProductIds,
            })
          : Promise.resolve({
              success: true,
              data: [] as RES_ActivoFijoDisponible[],
            }),
      ]);

      if (lotesRes.success && lotesRes.data) {
        setLotes(lotesRes.data);
      }

      if (activosRes.success && activosRes.data) {
        // Construir los activos a mostrar a partir de los que se recibieron originalmente
        const assetsFromReception = itemsATransferir
          .filter(
            (item) =>
              item.tipo_bien === TipoBien.ActivoFijo && item.id_activo_fijo,
          )
          .map((item) => {
            const extraInfo = (activosRes.data || []).find(
              (a) => Number(a.id_activo) === Number(item.id_activo_fijo),
            );

            return {
              id_activo: Number(item.id_activo_fijo),
              correlativo: item.correlativo_activo_fijo || "",
              id_producto: item.id_producto,
              producto: item.producto,
              id_almacen: extraInfo
                ? extraInfo.id_almacen
                : idAlmacenRecepcionista,
              almacen: extraInfo ? extraInfo.almacen : null,
              en_almacen_principal: extraInfo
                ? extraInfo.en_almacen_principal
                : true,
              id_mina: extraInfo ? extraInfo.id_mina : null,
              mina: extraInfo ? extraInfo.mina : null,
              es_auditable: extraInfo ? extraInfo.es_auditable : false,
              id_categoria: extraInfo ? extraInfo.id_categoria : 0,
              categoria: extraInfo ? extraInfo.categoria : "",
              para_transporte: extraInfo ? extraInfo.para_transporte : false,
              control_por_odometro: extraInfo
                ? extraInfo.control_por_odometro
                : false,
              control_por_horometro: extraInfo
                ? extraInfo.control_por_horometro
                : false,
              id_unidad_medida_base: item.id_unidad_medida_base,
              unidad_medida_base: "",
              unidad_medida_base_abv: item.unidad_medida_base_abv,
            } as RES_ActivoFijoDisponible;
          });

        setActivosFijos(assetsFromReception);

        // Inicializar cantidades de activos fijos a 1 (seleccionados)
        const initialActivos: Record<number, Record<number, number>> = {};
        itemsATransferir.forEach((item) => {
          if (item.tipo_bien === TipoBien.ActivoFijo && item.id_activo_fijo) {
            initialActivos[item.id_recepcion_detalle] = {
              [Number(item.id_activo_fijo)]: 1,
            };
          }
        });
        setTransferenciaCantidadesActivos(initialActivos);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [idAlmacenRecepcionista, itemsATransferir]);

  const handleCantLoteChange = (
    idDetalle: number,
    idLote: number,
    newCant: number,
  ) => {
    setTransferenciaCantidades((prev) => {
      const newState = { ...prev };
      if (!newState[idDetalle]) newState[idDetalle] = {};
      newState[idDetalle][idLote] = newCant;
      if (newCant <= 0) delete newState[idDetalle][idLote];
      return newState;
    });
  };

  const handleCantActivoChange = useCallback(
    (idDetalle: number, idActivo: number, val: number) => {
      setTransferenciaCantidadesActivos((prev) => {
        const prevCantidades = prev[idDetalle] || {};
        const safeValue = val > 0 ? 1 : 0;
        if (prevCantidades[idActivo] === safeValue) return prev;
        return {
          ...prev,
          [idDetalle]: {
            ...prevCantidades,
            [idActivo]: safeValue,
          },
        };
      });
    },
    [],
  );

  const totalTransferenciaGeneralBase = useMemo(() => {
    let total = 0;
    Object.entries(transferenciaCantidades).forEach(([idDetStr, lotesMap]) => {
      const idDet = Number(idDetStr);
      const item = itemsATransferir.find(
        (i) => i.id_recepcion_detalle === idDet,
      );
      if (item && item.tipo_bien !== TipoBien.ActivoFijo) {
        Object.values(lotesMap).forEach((v) => (total += v || 0));
      }
    });
    Object.entries(transferenciaCantidadesActivos).forEach(
      ([idDetStr, activosMap]) => {
        const idDet = Number(idDetStr);
        const item = itemsATransferir.find(
          (i) => i.id_recepcion_detalle === idDet,
        );
        if (item && item.tipo_bien === TipoBien.ActivoFijo) {
          Object.values(activosMap).forEach((v) => (total += v || 0));
        }
      },
    );
    return total;
  }, [
    transferenciaCantidades,
    transferenciaCantidadesActivos,
    itemsATransferir,
  ]);

  const registrarTransferencia = async (
    idRecepcion: number,
    idAlmacenDestino: number | null,
    idMinaDestino?: number | null,
    tipoDestino?: "almacen" | "mina",
  ) => {
    if (!transporte.medio_entrega) {
      setError("Complete todos los campos obligatorios");
      return;
    }

    if (transporte.medio_entrega === MedioEntrega.Propio && !transporte.id_empleado_recibe) {
      setError("Debe seleccionar el chofer/encargado");
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
        setError("Complete todos los campos de transporte obligatorios");
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
        setError("Complete todos los campos de la agencia obligatorios");
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    const detalles = [];

    // --- Lotes normales ---
    for (const [idDetalleStr, lotesMap] of Object.entries(
      transferenciaCantidades,
    )) {
      const idDetalle = Number(idDetalleStr);
      const item = itemsATransferir.find(
        (i) => i.id_recepcion_detalle === idDetalle,
      );
      if (item && item.tipo_bien !== TipoBien.ActivoFijo) {
        for (const [idLoteStr, cant_base] of Object.entries(lotesMap)) {
          if (cant_base > 0) {
            detalles.push({
              id_orden_compra_recepcion_detalle: idDetalle,
              id_lote_producto: Number(idLoteStr),
              cantidad_transferida_base: cant_base,
              comentario: "",
            });
          }
        }
      }
    }

    // --- Activos Fijos ---
    for (const [idDetalleStr, activosMap] of Object.entries(
      transferenciaCantidadesActivos,
    )) {
      const idDetalle = Number(idDetalleStr);
      const item = itemsATransferir.find(
        (i) => i.id_recepcion_detalle === idDetalle,
      );
      if (item && item.tipo_bien === TipoBien.ActivoFijo) {
        for (const [idActivoStr, cant] of Object.entries(activosMap)) {
          if (cant > 0) {
            detalles.push({
              id_orden_compra_recepcion_detalle: idDetalle,
              id_lote_producto: 0,
              id_activo_fijo: Number(idActivoStr),
              cantidad_transferida_base: 1,
              comentario: "",
            });
          }
        }
      }
    }

    if (detalles.length === 0) {
      setError("Debe asignar al menos una cantidad a transferir.");
      setSubmitting(false);
      return;
    }

    const payload: Record<string, unknown> = {
      id_orden_compra_recepcion: idRecepcion,
      id_almacen_destino: tipoDestino === "mina" ? null : idAlmacenDestino,
      id_mina_destino: tipoDestino === "mina" ? idMinaDestino : null,
      id_empleado_recibe: transporte.medio_entrega === MedioEntrega.Propio ? Number(transporte.id_empleado_recibe) : null,
      fecha_hora_transferencia: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      observacion,
      detalles,
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
    };

    try {
      const user = useAuthStore.getState().usuario;
      payload.id_empleado_transferencia = user?.id_empleado || 1;

      const res = await OrdenCompraService.registrarTransferencia(
        payload,
        evidencias,
      );
      if (res.success) {
        // Calcular resumen de cantidades transferidas por detalle
        const resumen: Record<number, number> = {};

        Object.entries(transferenciaCantidades).forEach(
          ([idDetalleStr, lotesMap]) => {
            const idDetalle = Number(idDetalleStr);
            const total = Object.values(lotesMap).reduce(
              (sum, cant) => sum + cant,
              0,
            );
            if (total > 0) resumen[idDetalle] = total;
          },
        );

        Object.entries(transferenciaCantidadesActivos).forEach(
          ([idDetalleStr, activosMap]) => {
            const idDetalle = Number(idDetalleStr);
            const total = Object.values(activosMap).reduce(
              (sum, cant) => sum + cant,
              0,
            );
            if (total > 0) resumen[idDetalle] = total;
          },
        );

        onSuccess(resumen);
      } else {
        setError(res.message);
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Error al transferir");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    loading: loading || loadingPersonal,
    itemsATransferir,
    lotes,
    activosFijos,
    transferenciaCantidades,
    transferenciaCantidadesActivos,
    personal,
    transporte,
    onChangeTransporte,
    observacion,
    setObservacion,
    evidencias,
    setEvidencias,
    submitting,
    error,
    totalTransferenciaGeneralBase,
    cargarDatosIniciales,
    handleCantLoteChange,
    handleCantActivoChange,
    registrarTransferencia,
  };
};
