import { useState, useEffect, useRef } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { PrestamosAtencionService } from "../service/prestamos-atencion.service";
import type {
  DTO_RecibirEntregaReposicionItem,
  DTO_ItemRecepcionReposicion,
} from "../service/prestamos-atencion.requests";
import type {
  RES_LoteDisponible,
  RES_TicketLote,
} from "../../../service/responses/lote-producto";
import { usePrint } from "../../../hooks/usePrint";
import type { RES_PrestamoEntregaDetalle } from "../../../service/responses/prestamos/prestamo-entrega";
import { AuxService } from "../../../service/auxiliar.service";
import { TipoBien } from "../../../shared/enums/_generic/tipo-bien";
import type { RES_UnidadMedida } from "../../../service/responses/unidad-medida";

export interface RES_PrestamoEntregaDetalleExtendido extends RES_PrestamoEntregaDetalle {
  selected?: boolean;
}

export interface DTO_RecibirLotExtendido extends DTO_RecibirEntregaReposicionItem {
  id_lote_existente: number | null;
  es_nuevo_lote: boolean;
  fecha_ingreso: string;
  descripcion: string;
  es_perecible: boolean;
  ajustes?: Record<number, number>; // idLote -> cantidad
  lote_correlativo?: string | null;
  lote_serie_factura?: string | null;
  lote_numero_factura?: string | null;
}

export interface GroupedReception {
  id_solicitud_reabastecimiento_detalle: number;
  id_producto: number;
  producto: string;
  total_entregado_base: number;
  unidad_base_abv: string;
  es_perecible: boolean;
  tipo_bien: string;
  detalles_origen: RES_PrestamoEntregaDetalleExtendido[];
  lots: DTO_RecibirLotExtendido[];
}

interface UseRegistroRecepcionProps {
  idEntrega?: number;
  tipoEntrega?: "Solicitud" | "Prestamo" | "Reposicion";
  idAlmacenSolicitante: number;
  detalles: RES_PrestamoEntregaDetalleExtendido[];
  onSuccess: (lotesNuevos?: RES_TicketLote[]) => void;
  isGlobal?: boolean;
}

export const useRegistroRecepcion = ({
  idAlmacenSolicitante,
  detalles,
  onSuccess,
  idEntrega,
  tipoEntrega,
}: UseRegistroRecepcionProps) => {
  const { notifySuccess, notifyError } = useNotify();
  const { prepare } = usePrint();

  const [groupedItems, setGroupedItems] = useState<GroupedReception[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingAction, setLoadingAction] = useState(false);
  const [unidades, setUnidades] = useState<RES_UnidadMedida[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [lotesDisponibles, setLotesDisponibles] = useState<
    RES_LoteDisponible[]
  >([]);
  const [loadingLotesDisp, setLoadingLotesDisp] = useState(false);
  const defaultsApplied = useRef(false);

  useEffect(() => {
    if (detalles && detalles.length > 0 && groupedItems.length === 0) {
      const grouped: Record<number, GroupedReception> = {};
      detalles.forEach((d) => {
        const key = d.id_producto;
        if (!grouped[key]) {
          grouped[key] = {
            id_solicitud_reabastecimiento_detalle:
              d.id_solicitud_reabastecimiento_detalle,
            id_producto: d.id_producto,
            producto: d.producto,
            total_entregado_base: 0,
            unidad_base_abv: d.unidad_medida_base_abv,
            es_perecible: d.es_perecible,
            tipo_bien: d.tipo_bien,
            detalles_origen: [],
            lots: [],
          };
        }
        const pendienteReal =
          Number(d.cantidad_base) -
          (Number(d.cantidad_total_recepcionada_base) || 0);
        grouped[key].total_entregado_base += pendienteReal;
        grouped[key].detalles_origen.push(d);
      });

      const initialGrouped = Object.values(grouped).map((g) => {
        const itemsConPendiente = g.detalles_origen.filter((d) => {
          const pendiente =
            Number(d.cantidad_base) -
            (Number(d.cantidad_total_recepcionada_base) || 0);
          return pendiente > 0;
        });

        return {
          ...g,
          detalles_origen: g.detalles_origen.map((d) => {
            const pendiente =
              Number(d.cantidad_base) -
              (Number(d.cantidad_total_recepcionada_base) || 0);
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
                    (Number(d.cantidad_total_recepcionada_base) || 0);
                  return {
                    id_solicitud_reabastecimiento_detalle:
                      d.id_solicitud_reabastecimiento_detalle,
                    id_entrega_detalle: d.id_entrega_detalle,
                    id_producto: g.id_producto,
                    id_lote_producto: d.id_lote_producto,
                    cantidad_lote: d.cantidad_lot,
                    cantidad_solicitud: d.cantidad_prestamo,
                    id_unidad_medida_lote: d.id_unidad_medida_lot,
                    id_unidad_medida_solicitada: d.id_unidad_medida_pr,
                    es_nuevo_lote: false,
                    cantidad_base: pendiente,
                    id_lote_existente: null,
                    fecha_vencimiento:
                      g.es_perecible && d.fecha_vencimiento
                        ? d.fecha_vencimiento
                        : null,
                    id_unidad_medida: d.id_unidad_medida_base,
                    contenido_por_presentacion: 1,
                    fecha_ingreso: new Date().toISOString(),
                    descripcion: "",
                    es_perecible: g.es_perecible,
                    ajustes: {},
                    lote_correlativo: d.lote_correlativo,
                    lote_serie_factura: d.lote_serie_factura,
                    lote_numero_factura: d.lote_numero_factura,
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
    const fetchAllLotes = async () => {
      if (!detalles || detalles.length === 0) return;

      const itemsConLote = detalles.filter(
        (d) => d.tipo_bien !== TipoBien.ActivoFijo,
      );
      if (itemsConLote.length === 0) return;

      const uniqueProductIds = Array.from(
        new Set(itemsConLote.map((d) => d.id_producto)),
      );
      if (uniqueProductIds.length === 0) return;

      setLoadingLotesDisp(true);
      try {
        const res = await AuxService.get_lotes_disponibles(
          idAlmacenSolicitante,
          uniqueProductIds,
        );
        if (res.success && res.data) {
          setLotesDisponibles(res.data);
        }
      } catch (err) {
        console.error("Error fetching lots in batch:", err);
        notifyError("Error al cargar los lotes disponibles.");
      } finally {
        setLoadingLotesDisp(false);
      }
    };

    fetchAllLotes();
  }, [detalles, idAlmacenSolicitante, notifyError]);

  useEffect(() => {
    if (
      !defaultsApplied.current &&
      lotesDisponibles.length > 0 &&
      groupedItems.length > 0
    ) {
      setGroupedItems((prev) => {
        return prev.map((group) => {
          const lotsForProduct = lotesDisponibles.filter(
            (l) => l.id_producto === group.id_producto,
          );
          if (lotsForProduct.length > 0) {
            const firstLote = lotsForProduct[0];
            const updatedLots = group.lots.map((lot, idx) => {
              if (idx === 0) {
                return {
                  ...lot,
                  es_nuevo_lote: false,
                  id_lote_existente: firstLote.id_lote,
                  ajustes: { [firstLote.id_lote]: Number(lot.cantidad_base) },
                };
              }
              return lot;
            });
            return { ...group, lots: updatedLots };
          }
          return group;
        });
      });
      defaultsApplied.current = true;
    }
  }, [lotesDisponibles, groupedItems.length]);

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
            (Number(originalDetail.cantidad_total_recepcionada_base) || 0)
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

      if ((field as string) === "id_unidad_medida") {
        const selectedU = unidades.find(
          (u) => u.id_unidad_medida === Number(finalValue),
        );
        if (selectedU?.abreviatura === group.unidad_base_abv) {
          lots[lotIndex].contenido_por_presentacion = 1;
        }
      }

      group.lots = lots;
      newGrouped[groupIndex] = group;

      const currentSum = group.lots.reduce(
        (acc, l) => acc + (Number(l.cantidad_base) || 0),
        0,
      );
      setErrors((prevErr) => {
        const next = { ...prevErr };
        delete next[`groups.${groupIndex}.lots.${lotIndex}.${field}`];
        if (Math.abs(currentSum - group.total_entregado_base) < 0.0001) {
          delete next[`groups.${groupIndex}.cantidad_total`];
        }
        return next;
      });

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

  const getLotError = (
    groupIndex: number,
    lotIndex: number,
    field: keyof DTO_RecibirLotExtendido,
  ) => {
    return errors[`groups.${groupIndex}.lots.${lotIndex}.${field}`] || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        if (!lot.es_nuevo_lote && !lot.id_lote_existente) {
          newErrors[`groups.${gIdx}.lots.${lIdx}.id_lote_existente`] =
            "Seleccione al menos un lote.";
          hasErrors = true;
        }
        if (lot.es_nuevo_lote && !lot.fecha_ingreso) {
          newErrors[`groups.${gIdx}.lots.${lIdx}.fecha_ingreso`] = "Requerido.";
          hasErrors = true;
        }
        if (lot.es_nuevo_lote && group.es_perecible && !lot.fecha_vencimiento) {
          newErrors[`groups.${gIdx}.lots.${lIdx}.fecha_vencimiento`] =
            "Requerido.";
          hasErrors = true;
        }
      });

      // Validate that each detail's total in lots doesn't exceed its original pending quantity
      group.detalles_origen.forEach((origen) => {
        const pendiente =
          Number(origen.cantidad_base) -
          (Number(origen.cantidad_total_recepcionada_base) || 0);
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

    if (hasErrors) {
      setErrors(newErrors);
      notifyError("Revise las cantidades.");
      return;
    }

    const tieneLotesImprimibles = groupedItems.some((g) =>
      g.lots.some((l) => l.es_nuevo_lote),
    );
    let printerWin: Window | null = null;

    if (tieneLotesImprimibles) {
      printerWin = prepare("TicketLotePrinter");
    }

    setLoadingAction(true);
    try {
      if (tipoEntrega === "Reposicion") {
        const repoId = Number(idEntrega);
        if (!repoId) throw new Error("ID de reposición no encontrado");

        const itemsRepo: DTO_ItemRecepcionReposicion[] = [];
        groupedItems.forEach((group) => {
          if (group.tipo_bien === TipoBien.ActivoFijo) {
            group.detalles_origen.forEach((origen) => {
              if (origen.selected) {
                itemsRepo.push({
                  id_reposicion_detalle: origen.id_entrega_detalle,
                  es_activo_fijo: true,
                  id_activo_fijo: origen.id_activo_fijo,
                  cantidad_base: 1,
                  es_nuevo_lote: false,
                  id_unidad_medida: origen.id_unidad_medida_base,
                  contenido_por_presentacion: 1,
                });
              }
            });
            return;
          }

          group.lots.forEach((lot) => {
            if (lot.es_nuevo_lote) {
              itemsRepo.push({
                id_reposicion_detalle:
                  lot.id_solicitud_reabastecimiento_detalle,
                cantidad_base: lot.cantidad_base,
                es_nuevo_lote: true,
                id_unidad_medida: lot.id_unidad_medida,
                contenido_por_presentacion: lot.contenido_por_presentacion,
                descripcion: lot.descripcion,
                fecha_vencimiento: lot.fecha_vencimiento,
                fecha_ingreso: lot.fecha_ingreso,
              });
            } else {
              itemsRepo.push({
                id_reposicion_detalle:
                  lot.id_solicitud_reabastecimiento_detalle,
                cantidad_base: lot.cantidad_base,
                es_nuevo_lote: false,
                id_lote_existente: lot.id_lote_existente ?? 0,
                id_unidad_medida: lot.id_unidad_medida,
                contenido_por_presentacion: lot.contenido_por_presentacion,
              });
            }
          });
        });

        const res = await PrestamosAtencionService.registrarRecepcionReposicion(
          {
            id_reposicion: repoId,
            fecha_hora_recepcion: new Date().toISOString(),
            con_incidencia: false,
            items: itemsRepo,
          },
        );

        if (res.success) {
          notifySuccess("Recepción registrada correctamente.");
          onSuccess(res.data ?? undefined);
        } else {
          notifyError(res.message || "Error al registrar.");
          printerWin?.close();
        }
        return;
      }
    } catch (err: unknown) {
      printerWin?.close();
      const message = err instanceof Error ? err.message : "Error inesperado.";
      notifyError(message);
    } finally {
      setLoadingAction(false);
    }
  };

  const isFormValid =
    groupedItems.length > 0 &&
    groupedItems.every((group) => {
      if (group.tipo_bien === TipoBien.ActivoFijo) {
        const hasPending = group.detalles_origen.some((d) => {
          const pendiente =
            Number(d.cantidad_base) -
            (Number(d.cantidad_total_recepcionada_base) || 0);
          return pendiente > 0;
        });
        if (hasPending) {
          return group.detalles_origen.some((d) => d.selected);
        }
        return true;
      }
      return group.detalles_origen.every((origen) => {
        const pendiente =
          Number(origen.cantidad_base) -
          (Number(origen.cantidad_total_recepcionada_base) || 0);
        const sumLotsForDetail = group.lots
          .filter((l) => l.id_entrega_detalle === origen.id_entrega_detalle)
          .reduce((acc, l) => acc + (Number(l.cantidad_base) || 0), 0);

        const matches =
          sumLotsForDetail >= 0 && sumLotsForDetail <= pendiente + 0.0001;
        const lotsValid = group.lots
          .filter((l) => l.id_entrega_detalle === origen.id_entrega_detalle)
          .every((lot) => {
            if (lot.cantidad_base <= 0) return false;
            if (lot.es_nuevo_lote) {
              if (!lot.fecha_ingreso) return false;
              if (group.es_perecible && !lot.fecha_vencimiento) return false;
            } else {
              if (!lot.id_lote_existente) return false;
            }
            return true;
          });

        return matches && lotsValid;
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
    lotesDisponibles,
    loadingLotesDisp,
    errors,
    isFormValid,
  };
};
