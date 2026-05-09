import { useState, useEffect, useRef } from "react";
import { formatNumber } from "../../../shared/functions/formatNumber";
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
import type { RES_UnidadMedida } from "../../../service/responses/unidad-medida";
import type { RES_PrestamoEntregaDetalle } from "../../../service/responses/prestamos/prestamo-entrega";
import { AuxService } from "../../../service/aux.service";

export interface DTO_RecibirLotExtendido extends DTO_RecibirEntregaReposicionItem {
  id_lote_existente: number | null;
  es_nuevo_lote: boolean;
  fecha_ingreso: string;
  descripcion: string;
  es_perecible: boolean;
  ajustes?: Record<number, number>; // idLote -> cantidad
}

export interface GroupedReception {
  id_solicitud_reabastecimiento_detalle: number;
  id_producto: number;
  producto: string;
  total_entregado_base: number;
  unidad_base_abv: string;
  es_perecible: boolean;
  detalles_origen: RES_PrestamoEntregaDetalle[];
  lots: DTO_RecibirLotExtendido[];
}

interface UseRegistroRecepcionProps {
  idEntrega?: number;
  tipoEntrega?: "Solicitud" | "Prestamo" | "Reposicion";
  idAlmacenSolicitante: number;
  detalles: RES_PrestamoEntregaDetalle[];
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
        const key = d.id_solicitud_reabastecimiento_detalle;
        if (!grouped[key]) {
          grouped[key] = {
            id_solicitud_reabastecimiento_detalle: key,
            id_producto: d.id_producto,
            producto: d.producto,
            total_entregado_base: 0,
            unidad_base_abv: d.unidad_medida_base_abv,
            es_perecible: d.es_perecible,
            detalles_origen: [],
            lots: [],
          };
        }
        grouped[key].total_entregado_base += Number(d.cantidad_base);
        grouped[key].detalles_origen.push(d);
      });

      const initialGrouped = Object.values(grouped).map((g) => ({
        ...g,
        lots: [
          {
            id_solicitud_reabastecimiento_detalle:
              g.id_solicitud_reabastecimiento_detalle,
            id_entrega_detalle: g.detalles_origen[0].id_entrega_detalle,
            id_producto: g.id_producto,
            id_lote_producto: null,
            cantidad_lote: 0,
            cantidad_solicitud: 0,
            id_unidad_medida_lote: g.detalles_origen[0].id_unidad_medida_base,
            id_unidad_medida_solicitada:
              g.detalles_origen[0].id_unidad_medida_pr,
            es_nuevo_lote: false,
            cantidad_base: g.total_entregado_base,
            id_lote_existente: null,
            fecha_vencimiento:
              g.es_perecible && g.detalles_origen[0].fecha_vencimiento
                ? g.detalles_origen[0].fecha_vencimiento
                : null,
            id_unidad_medida: g.detalles_origen[0].id_unidad_medida_base,
            contenido_por_presentacion: 1,
            fecha_ingreso: new Date().toISOString(),
            descripcion: "",
            es_perecible: g.es_perecible,
            ajustes: {},
          },
        ],
      }));
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

      const uniqueProductIds = Array.from(
        new Set(detalles.map((d) => d.id_producto)),
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
        const lastIdx = lots.length - 1;

        if (lots.length > 1) {
          if (lotIndex !== lastIdx) {
            const otherSum = lots.reduce((acc, l, idx) => {
              if (idx === lotIndex || idx === lastIdx) return acc;
              return acc + (Number(l.cantidad_base) || 0);
            }, 0);
            const maxForThis = Math.max(
              0,
              group.total_entregado_base - otherSum,
            );
            const cappedVal = Math.min(numVal, maxForThis);
            finalValue = cappedVal as DTO_RecibirLotExtendido[K];

            const remaining = Math.max(
              0,
              group.total_entregado_base - otherSum - cappedVal,
            );
            lots[lastIdx] = {
              ...lots[lastIdx],
              cantidad_base: remaining,
              ajustes:
                !lots[lastIdx].es_nuevo_lote && lots[lastIdx].id_lote_existente
                  ? { [lots[lastIdx].id_lote_existente]: remaining }
                  : lots[lastIdx].ajustes || {},
            };
          } else {
            const otherSum = lots.reduce((acc, l, idx) => {
              if (idx === lotIndex) return acc;
              return acc + (Number(l.cantidad_base) || 0);
            }, 0);
            const maxForLast = Math.max(
              0,
              group.total_entregado_base - otherSum,
            );
            finalValue = Math.min(
              numVal,
              maxForLast,
            ) as DTO_RecibirLotExtendido[K];
          }
        } else {
          finalValue = group.total_entregado_base as DTO_RecibirLotExtendido[K];
        }
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

  const addLot = (groupIndex: number) => {
    setGroupedItems((prev) => {
      const newGrouped = [...prev];
      const g = { ...newGrouped[groupIndex] };
      const lots = [...g.lots];
      const lastIdx = lots.length - 1;
      const lastLot = { ...lots[lastIdx] };

      const currentQty = Number(lastLot.cantidad_base) || 0;
      const halfQty = Math.floor(currentQty / 2);
      const restQty = currentQty - halfQty;

      lastLot.cantidad_base = restQty;
      if (!lastLot.es_nuevo_lote && lastLot.id_lote_existente) {
        lastLot.ajustes = { [lastLot.id_lote_existente]: restQty };
      }
      lots[lastIdx] = lastLot;

      lots.push({
        ...lastLot,
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

      if (lots.length === 1) {
        lots[0].cantidad_base = newGrouped[groupIndex].total_entregado_base;
        if (!lots[0].es_nuevo_lote && lots[0].id_lote_existente) {
          lots[0].ajustes = {
            [lots[0].id_lote_existente]: lots[0].cantidad_base,
          };
        }
      }

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
      const lastIdx = lots.length - 1;

      if (isActive) {
        let finalQty = qty;
        const otherFixedSum = lots.reduce((acc, l, idx) => {
          if (idx === lotIndex || idx === lastIdx) return acc;
          return acc + (Number(l.cantidad_base) || 0);
        }, 0);

        if (finalQty === undefined) {
          const currentOthers = lots.reduce(
            (acc, l, idx) =>
              idx === lotIndex ? acc : acc + (Number(l.cantidad_base) || 0),
            0,
          );
          finalQty = Math.max(0, group.total_entregado_base - currentOthers);
        } else {
          const maxAvailable = Math.max(
            0,
            group.total_entregado_base - otherFixedSum,
          );
          finalQty = Math.min(finalQty, maxAvailable);
        }

        ajustes[idLote] = finalQty;
        lot.cantidad_base = finalQty;
        lot.id_lote_existente = idLote;

        if (lots.length > 1 && lotIndex !== lastIdx) {
          const remaining = Math.max(
            0,
            group.total_entregado_base - otherFixedSum - finalQty,
          );
          lots[lastIdx] = {
            ...lots[lastIdx],
            cantidad_base: remaining,
            ajustes:
              !lots[lastIdx].es_nuevo_lote && lots[lastIdx].id_lote_existente
                ? { [lots[lastIdx].id_lote_existente]: remaining }
                : lots[lastIdx].ajustes || {},
          };
        }
      } else {
        lot.id_lote_existente = null;
        lot.cantidad_base = 0;

        if (lots.length > 1 && lotIndex !== lastIdx) {
          const otherFixedSum = lots.reduce((acc, l, idx) => {
            if (idx === lotIndex || idx === lastIdx) return acc;
            return acc + (Number(l.cantidad_base) || 0);
          }, 0);
          const remaining = Math.max(
            0,
            group.total_entregado_base - otherFixedSum,
          );
          lots[lastIdx] = {
            ...lots[lastIdx],
            cantidad_base: remaining,
            ajustes:
              !lots[lastIdx].es_nuevo_lote && lots[lastIdx].id_lote_existente
                ? { [lots[lastIdx].id_lote_existente]: remaining }
                : lots[lastIdx].ajustes || {},
          };
        }
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
      let sumBase = 0;
      group.lots.forEach((lot, lIdx) => {
        const cant = Number(lot.cantidad_base) || 0;
        sumBase += cant;
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
      if (Math.abs(sumBase - group.total_entregado_base) > 0.0001) {
        newErrors[`groups.${gIdx}.cantidad_total`] =
          `La suma no coincide (${formatNumber(sumBase)}/${formatNumber(group.total_entregado_base)}).`;
        hasErrors = true;
      }
    });

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
      if (tipoEntrega === "Reposicion") {
        const repoId = Number(idEntrega);
        if (!repoId) throw new Error("ID de reposición no encontrado");

        const itemsRepo: DTO_ItemRecepcionReposicion[] = [];
        groupedItems.forEach((group) => {
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

      // Lógica para otros tipos (Solicitud, etc) si es necesario...
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
      const sumBase = group.lots.reduce(
        (acc, l) => acc + (Number(l.cantidad_base) || 0),
        0,
      );
      const sumMatch = Math.abs(sumBase - group.total_entregado_base) < 0.0001;
      const lotsValid = group.lots.every((lot) => {
        if (lot.cantidad_base <= 0) return false;
        if (lot.es_nuevo_lote) {
          if (!lot.fecha_ingreso) return false;
          if (group.es_perecible && !lot.fecha_vencimiento) return false;
        } else {
          if (!lot.id_lote_existente) return false;
        }
        return true;
      });
      return sumMatch && lotsValid;
    });

  return {
    groupedItems,
    setLotValue,
    addLot,
    removeLot,
    updateTabularAdjustment,
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
