import { useState, useEffect } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { useAuthStore } from "../../../stores/auth.store";
import { ReabastecimientoService } from "../service/reabastecimiento.service";
import type {
  DTO_RecibirEntregaItem,
  DTO_RegistrarRecepcion,
} from "../service/reabastecimiento.requests";
import type {
  RES_LoteDisponible,
  RES_TicketLote,
} from "../../../service/responses/lote-producto";
import { usePrint } from "../../../hooks/usePrint";
import type { HistorialEntregaDetalleItem } from "./useHistorialEntregas";
import type { RES_UnidadMedida } from "../../../service/responses/unidad-medida";
import { AuxService } from "../../../service/auxiliar.service";
import { TipoBien } from "../../../shared/enums/_generic/tipo-bien";

export interface DTO_RecibirLotExtendido extends DTO_RecibirEntregaItem {
  ajustes?: Record<number, number>; // idLote -> cantidad
  lote_correlativo?: string | null;
  lote_serie_factura?: string | null;
  lote_numero_factura?: string | null;
}

export type GroupedReception = HistorialEntregaDetalleItem & {
  id_solicitud_reabastecimiento_detalle: number;
  producto: string;
  total_entregado_base: number;
  unidad_base_abv: string;
  es_perecible: boolean;
  tipo_bien: string;
  detalles_origen: (HistorialEntregaDetalleItem & { selected?: boolean })[];
  lots: DTO_RecibirLotExtendido[];
};

interface UseRegistroRecepcionProps {
  idEntrega?: number;
  tipoEntrega?: "Solicitud" | "Prestamo";
  idAlmacenSolicitante: number;
  detalles: HistorialEntregaDetalleItem[];
  onSuccess: (lotesNuevos?: RES_TicketLote[]) => void;
}

export const useRegistroRecepcion = ({
  idEntrega,
  tipoEntrega,
  idAlmacenSolicitante,
  detalles,
  onSuccess,
}: UseRegistroRecepcionProps) => {
  const { notifySuccess, notifyError } = useNotify();
  const { usuario } = useAuthStore();
  const { prepare } = usePrint();

  const [groupedItems, setGroupedItems] = useState<GroupedReception[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingAction, setLoadingAction] = useState(false);
  const [unidades, setUnidades] = useState<RES_UnidadMedida[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);

  // Estados para cabecera de recepción
  const [fechaHoraRecepcion, setFechaHoraRecepcion] = useState<Date | null>(
    new Date(),
  );
  const [conIncidencia, setConIncidencia] = useState(false);
  const [observacion, setObservacion] = useState("");
  const [evidencias, setEvidencias] = useState<File[]>([]);

  const [lotesDisponibles, setLotesDisponibles] = useState<
    RES_LoteDisponible[]
  >([]);
  const [loadingLotes, setLoadingLotes] = useState(false);

  useEffect(() => {
    if (detalles && detalles.length > 0 && groupedItems.length === 0) {
      const grouped: Record<number, GroupedReception> = {};
      detalles.forEach((d) => {
        const key = d.id_producto;

        if (!grouped[key]) {
          grouped[key] = {
            ...d,
            unidad_base_abv: d.unidad_medida_base_abv,
            total_entregado_base: 0,
            es_perecible: d.es_perecible,
            tipo_bien: d.tipo_bien,
            lots: [],
            detalles_origen: [],
          };
        }
        const pendienteReal =
          Number(d.cantidad_base) -
          (Number(d.cantidad_recibida_total_base) || 0);
        grouped[key].total_entregado_base += pendienteReal;
        grouped[key].detalles_origen.push(d);
      });

      const initialGrouped = Object.values(grouped).map((g) => {
        const itemsConPendiente = g.detalles_origen.filter((d) => {
          const pendiente =
            Number(d.cantidad_base) -
            (Number(d.cantidad_recibida_total_base) || 0);
          return pendiente > 0;
        });

        return {
          ...g,
          detalles_origen: g.detalles_origen.map((d) => {
            const pendiente =
              Number(d.cantidad_base) -
              (Number(d.cantidad_recibida_total_base) || 0);
            return {
              ...d,
              selected: d.tipo_bien === TipoBien.ActivoFijo && pendiente > 0,
            };
          }),
          lots:
            g.tipo_bien === TipoBien.ActivoFijo
              ? []
              : itemsConPendiente.map((d) => {
                  const pendiente =
                    Number(d.cantidad_base) -
                    (Number(d.cantidad_recibida_total_base) || 0);
                  return {
                    id_solicitud_reabastecimiento_detalle:
                      d.id_solicitud_reabastecimiento_detalle,
                    id_entrega_detalle: d.id_entrega_detalle,
                    es_nuevo_lote: false,
                    cantidad_base: pendiente,
                    max_permitido: pendiente,
                    id_lote_existente: null,
                    fecha_vencimiento: null,
                    id_unidad_medida: d.id_unidad_medida_base,
                    contenido_por_presentacion: 1,
                    fecha_ingreso: new Date().toISOString(),
                    es_perecible: g.es_perecible,
                    ajustes: {},
                    lote_correlativo: d.lote_correlativo,
                    lote_serie_factura: d.lote_serie_factura,
                    lote_numero_factura: d.lote_numero_factura,
                    lote_costo_por_unidad: d.lote_costo_por_unidad,
                    lote_id_orden_compra_detalle:
                      d.lote_id_orden_compra_detalle,
                    lote_id_orden_compra: d.lote_id_orden_compra,
                    lote_id_orden_compra_comprobante:
                      d.lote_id_orden_compra_comprobante,
                    id_lote_producto: d.id_lote_producto,
                  };
                }),
        };
      });
      setGroupedItems(initialGrouped);
    }
  }, [detalles, groupedItems.length]);

  useEffect(() => {
    const loadUnidades = async () => {
      setLoadingUnidades(true);
      try {
        const res = await AuxService.get_unidades_medida();
        if (res.success && res.data) setUnidades(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUnidades(false);
      }
    };
    loadUnidades();
  }, []);

  useEffect(() => {
    const itemsConLote = detalles.filter(
      (d) => d.tipo_bien !== TipoBien.ActivoFijo,
    );
    const ids = Array.from(new Set(itemsConLote.map((d) => d.id_producto)));
    if (ids.length > 0) {
      setLoadingLotes(true);
      AuxService.get_lotes_disponibles(idAlmacenSolicitante, ids)
        .then((res) => {
          if (res.success && res.data) {
            setLotesDisponibles(res.data);

            // Si el producto no tiene lotes existentes, cambiamos a "Nuevo Lote" por defecto
            setGroupedItems((prev) =>
              prev.map((group) => {
                const productLots = res.data!.filter(
                  (l) => l.id_producto === group.id_producto,
                );
                if (productLots.length === 0) {
                  return {
                    ...group,
                    lots: group.lots.map((lot) => ({
                      ...lot,
                      es_nuevo_lote: true,
                    })),
                  };
                }
                return group;
              }),
            );
          }
        })
        .finally(() => setLoadingLotes(false));
    }
  }, [detalles, idAlmacenSolicitante]);

  const setLotValue = <K extends keyof DTO_RecibirLotExtendido>(
    groupIndex: number,
    lotIndex: number,
    field: K,
    value: DTO_RecibirLotExtendido[K],
  ) => {
    setGroupedItems((prev) => {
      const newGrouped = [...prev];
      const group = { ...newGrouped[groupIndex] };
      const lots = [...group.lots];
      let finalValue = value;
      if (field === "cantidad_base") {
        const numVal = Number(value) || 0;
        const thisDetailId = lots[lotIndex].id_entrega_detalle;
        const originalDetail = group.detalles_origen.find(
          (d) => d.id_entrega_detalle === thisDetailId,
        );
        const originalDetailQty = originalDetail
          ? Number(originalDetail.cantidad_base) -
            (Number(originalDetail.cantidad_recibida_total_base) || 0)
          : group.total_entregado_base;

        const otherSumForDetail = lots.reduce((acc, l, idx) => {
          if (idx === lotIndex) return acc;
          if (l.id_entrega_detalle === thisDetailId) {
            return acc + (Number(l.cantidad_base) || 0);
          }
          return acc;
        }, 0);

        const maxAllowed = Math.max(0, originalDetailQty - otherSumForDetail);
        finalValue = Math.min(numVal, maxAllowed) as DTO_RecibirLotExtendido[K];
      }

      lots[lotIndex] = { ...lots[lotIndex], [field]: finalValue };

      if (field === "id_unidad_medida") {
        const selectedU = unidades.find(
          (u) => u.id_unidad_medida === Number(finalValue),
        );
        if (selectedU?.abreviatura === group.unidad_base_abv) {
          lots[lotIndex].contenido_por_presentacion = 1;
        }
      }

      group.lots = lots;
      newGrouped[groupIndex] = group;
      return newGrouped;
    });
  };

  const addLot = (groupIndex: number, lotIndex: number) => {
    setGroupedItems((prev) => {
      const newGrouped = [...prev];
      const g = { ...newGrouped[groupIndex] };
      const lots = [...g.lots];
      const targetLot = { ...lots[lotIndex] };

      const currentQty = Number(targetLot.cantidad_base) || 0;
      const halfQty = Math.floor(currentQty / 2);
      const restQty = currentQty - halfQty;

      targetLot.cantidad_base = restQty;
      if (!targetLot.es_nuevo_lote && targetLot.id_lote_existente) {
        targetLot.ajustes = { [targetLot.id_lote_existente]: restQty };
      }
      lots[lotIndex] = targetLot;

      lots.splice(lotIndex + 1, 0, {
        ...targetLot,
        cantidad_base: halfQty,
        id_lote_existente: null,
        ajustes: {},
        es_nuevo_lote: true,
      });

      g.lots = lots;
      newGrouped[groupIndex] = g;
      return newGrouped;
    });
  };

  const removeLot = (groupIndex: number, lotIndex: number) => {
    setGroupedItems((prev) => {
      if (prev[groupIndex].lots.length <= 1) return prev;
      const newGrouped = [...prev];
      const lots = [...newGrouped[groupIndex].lots];
      lots.splice(lotIndex, 1);
      newGrouped[groupIndex] = { ...newGrouped[groupIndex], lots };
      return newGrouped;
    });
  };

  const updateTabularAdjustment = (
    groupIndex: number,
    lotIndex: number,
    idLote: number,
    isActive: boolean,
    qty?: number,
  ) => {
    setGroupedItems((prev) => {
      const newGrouped = [...prev];
      const group = { ...newGrouped[groupIndex] };
      const lots = [...group.lots];
      const lot = { ...lots[lotIndex] };

      const ajustes: Record<number, number> = {};

      if (isActive) {
        const finalQty = qty ?? lot.cantidad_base;
        ajustes[idLote] = finalQty;
        lot.cantidad_base = finalQty;
        lot.id_lote_existente = idLote;
      } else {
        lot.id_lote_existente = null;
        lot.cantidad_base = 0;
      }

      lot.ajustes = ajustes;
      lots[lotIndex] = lot;
      group.lots = lots;
      newGrouped[groupIndex] = group;
      return newGrouped;
    });
  };

  const toggleActivoSeleccionado = (
    groupIndex: number,
    detailIndex: number,
  ) => {
    setGroupedItems((prev) => {
      const newGrouped = [...prev];
      const group = { ...newGrouped[groupIndex] };
      const detalles_origen = [...group.detalles_origen];
      const d = { ...detalles_origen[detailIndex] };
      d.selected = !d.selected;
      detalles_origen[detailIndex] = d;
      group.detalles_origen = detalles_origen;
      newGrouped[groupIndex] = group;
      return newGrouped;
    });
  };

  const getLotError = (
    groupIndex: number,
    lotIndex: number,
    field: keyof DTO_RecibirLotExtendido,
  ) => {
    return errors[`groups.${groupIndex}.lots.${lotIndex}.${field}`] || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idEntrega) return;

    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    groupedItems.forEach((group, gIdx) => {
      if (group.tipo_bien === TipoBien.ActivoFijo) {
        return;
      }

      group.lots.forEach((lot, lIdx) => {
        const cant = Number(lot.cantidad_base) || 0;
        if (cant <= 0) {
          newErrors[`groups.${gIdx}.lots.${lIdx}.cantidad_base`] =
            "Debe ser mayor a 0.";
          hasErrors = true;
        }
      });

      // Validate that each detail's total in lots doesn't exceed its original pending quantity
      group.detalles_origen.forEach((origen) => {
        const pendiente =
          Number(origen.cantidad_base) -
          (Number(origen.cantidad_recibida_total_base) || 0);
        const sumLotsForDetail = group.lots
          .filter((l) => l.id_entrega_detalle === origen.id_entrega_detalle)
          .reduce((acc, l) => acc + (Number(l.cantidad_base) || 0), 0);

        if (sumLotsForDetail > pendiente + 0.0001) {
          newErrors[`groups.${gIdx}.cantidad_total`] =
            `La cantidad para ${origen.lote_correlativo || "el lote"} supera el total entregado.`;
          hasErrors = true;
        }
      });
    });

    if (conIncidencia && (!observacion.trim() || evidencias.length === 0)) {
      notifyError("Complete los datos de la incidencia.");
      return;
    }

    if (hasErrors) {
      setErrors(newErrors);
      notifyError("Revise las cantidades.");
      return;
    }

    // --- PRE-APERTURA DE VENTANA DE IMPRESIÓN (Bypass de Popup Blocker) ---
    const tieneLotesImprimibles = groupedItems.some((g) =>
      g.lots.some((l) => l.es_nuevo_lote),
    );
    let printerWin: Window | null = null;

    if (tieneLotesImprimibles) {
      printerWin = prepare("TicketLotePrinter");
    }

    setLoadingAction(true);
    try {
      const items: DTO_RecibirEntregaItem[] = [];

      groupedItems.forEach((group) => {
        if (group.tipo_bien === TipoBien.ActivoFijo) {
          group.detalles_origen.forEach((origen) => {
            if (origen.selected) {
              items.push({
                id_solicitud_reabastecimiento_detalle:
                  origen.id_solicitud_reabastecimiento_detalle,
                id_entrega_detalle: origen.id_entrega_detalle,
                es_activo_fijo: true,
                id_activo_fijo: origen.id_activo_fijo,
                cantidad_base: 1,
                es_nuevo_lote: false,
                es_perecible: false,
              });
            }
          });
          return;
        }

        group.lots.forEach((lot) => {
          if (!lot.es_nuevo_lote && lot.ajustes) {
            Object.entries(lot.ajustes).forEach(([idLote, qtyAjuste]) => {
              items.push({
                id_solicitud_reabastecimiento_detalle:
                  lot.id_solicitud_reabastecimiento_detalle,
                id_entrega_detalle: lot.id_entrega_detalle,
                es_activo_fijo: false,
                es_nuevo_lote: false,
                id_lote_existente: Number(idLote),
                cantidad_base: Number(qtyAjuste),
                fecha_vencimiento: lot.fecha_vencimiento,
                id_unidad_medida: lot.id_unidad_medida,
                contenido_por_presentacion: lot.contenido_por_presentacion,
                fecha_ingreso: lot.fecha_ingreso,
                es_perecible: lot.es_perecible,
              });
            });
          } else {
            items.push({
              id_solicitud_reabastecimiento_detalle:
                lot.id_solicitud_reabastecimiento_detalle,
              id_entrega_detalle: lot.id_entrega_detalle,
              es_activo_fijo: false,
              es_nuevo_lote: lot.es_nuevo_lote,
              id_lote_existente: lot.id_lote_existente,
              cantidad_base: Number(lot.cantidad_base),
              fecha_vencimiento: lot.fecha_vencimiento,
              id_unidad_medida: lot.id_unidad_medida,
              contenido_por_presentacion: lot.contenido_por_presentacion,
              fecha_ingreso: lot.fecha_ingreso,
              es_perecible: lot.es_perecible,
            });
          }
        });
      });

      const recepcion: DTO_RegistrarRecepcion = {
        id_reabastecimiento_entrega: idEntrega,
        tipo_entrega: tipoEntrega || "Solicitud",
        con_incidencia: conIncidencia,
        observacion: observacion,
        fecha_hora_recepcion:
          fechaHoraRecepcion?.toISOString() || new Date().toISOString(),
        items,
      };

      const serviceMethod =
        tipoEntrega === "Prestamo"
          ? ReabastecimientoService.registrarRecepcionPrestamo
          : ReabastecimientoService.registrarRecepcionLogistica;

      const res = await serviceMethod(
        usuario?.id_empleado ?? 0,
        recepcion,
        evidencias,
      );

      if (res.success) {
        notifySuccess("Recepción registrada.");
        onSuccess(res.data ?? undefined);
      } else {
        notifyError(res.message || "Error al registrar.");
        printerWin?.close();
      }
    } catch {
      notifyError("Error de conexión.");
      printerWin?.close();
    } finally {
      setLoadingAction(false);
    }
  };

  const hasAtLeastOneItem = groupedItems.some((group) => {
    if (group.tipo_bien === TipoBien.ActivoFijo) {
      return group.detalles_origen.some((d) => d.selected);
    }
    return group.lots.some((l) => (Number(l.cantidad_base) || 0) > 0);
  });

  const isFormValid =
    hasAtLeastOneItem &&
    groupedItems.every((group) => {
      if (group.tipo_bien === TipoBien.ActivoFijo) return true;
      return group.detalles_origen.every((origen) => {
        const pendiente =
          Number(origen.cantidad_base) -
          (Number(origen.cantidad_recibida_total_base) || 0);
        const sumLotsForDetail = group.lots
          .filter((l) => l.id_entrega_detalle === origen.id_entrega_detalle)
          .reduce((acc, l) => acc + (Number(l.cantidad_base) || 0), 0);

        return sumLotsForDetail >= 0 && sumLotsForDetail <= pendiente + 0.0001;
      });
    });

  return {
    groupedItems,
    setLotValue,
    addLot,
    removeLot,
    updateTabularAdjustment,
    toggleActivoSeleccionado,
    getLotError,
    loadingAction,
    handleSubmit,
    unidades,
    loadingUnidades,
    errors,
    isFormValid,
    conIncidencia,
    setConIncidencia,
    observacion,
    setObservacion,
    evidencias,
    setEvidencias,
    fechaHoraRecepcion,
    setFechaHoraRecepcion,
    lotesDisponibles,
    loadingLotes,
  };
};
