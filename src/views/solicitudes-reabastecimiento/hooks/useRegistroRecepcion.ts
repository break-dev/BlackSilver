import { useState, useEffect, useCallback } from "react";
import { formatNumber } from "../../../presentation/functions/formatNumber";
import { useNotify } from "../../../hooks/useNotify";
import { ReabastecimientoService } from "../service/reabastecimiento.service";
import { LotesService } from "../../lotes-productos/service/lotes.service";
import type {
  RES_DetalleEntregaReabastecimiento,
  RES_LoteRecepcion,
} from "../service/reabastecimiento.responses";
import type { DTO_RecibirEntregaItem } from "../service/reabastecimiento.requests";
import type { RES_UnidadMedida } from "../../lotes-productos/service/lotes.responses";
import React from "react";

export interface DTO_RecibirLotExtendido extends DTO_RecibirEntregaItem {
  ajustes?: Record<number, number>; // idLote -> cantidad
}

export interface GroupedReception {
  id_solicitud_reabastecimiento_detalle: number;
  producto: string;
  total_entregado_base: number;
  unidad_base_abv: string;
  es_perecible: number;
  detalles_origen: RES_DetalleEntregaReabastecimiento[];
  lots: DTO_RecibirLotExtendido[];
}

interface UseRegistroRecepcionProps {
  idEntrega?: number;
  tipoEntrega?: "Solicitud" | "Prestamo";
  idAlmacenSolicitante: number;
  detalles: RES_DetalleEntregaReabastecimiento[];
  onSuccess: () => void;
  isGlobal?: boolean;
}

export const useRegistroRecepcion = ({
  idAlmacenSolicitante,
  detalles,
  onSuccess,
}: UseRegistroRecepcionProps) => {
  const { notifySuccess, notifyError } = useNotify();

  const [groupedItems, setGroupedItems] = useState<GroupedReception[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingAction, setLoadingAction] = useState(false);
  const [unidades, setUnidades] = useState<RES_UnidadMedida[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);

  useEffect(() => {
    if (detalles && detalles.length > 0 && groupedItems.length === 0) {
      const grouped: Record<number, GroupedReception> = {};
      detalles.forEach((d) => {
        const key = d.id_solicitud_reabastecimiento_detalle;
        if (!grouped[key]) {
          grouped[key] = {
            id_solicitud_reabastecimiento_detalle: key,
            producto: d.producto,
            total_entregado_base: 0,
            unidad_base_abv: d.unidad_base_abv,
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
            id_solicitud_reabastecimiento_detalle: g.id_solicitud_reabastecimiento_detalle,
            es_nuevo_lote: true,
            cantidad_base: g.total_entregado_base,
            id_lote_existente: null,
            fecha_vencimiento: g.es_perecible === 1 && g.detalles_origen[0].fecha_vencimiento ? g.detalles_origen[0].fecha_vencimiento : null,
            id_unidad_medida: g.detalles_origen[0].id_unidad_medida_base,
            contenido_por_presentacion: 1,
            fecha_ingreso: new Date().toISOString(),
            descripcion: "",
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
        const res = await LotesService.listarUnidades();
        if (res.success && res.data) setUnidades(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUnidades(false);
      }
    };
    loadUnidades();
  }, []);

  const setLotValue = <K extends keyof DTO_RecibirLotExtendido>(
    groupIndex: number,
    lotIndex: number,
    field: K,
    value: DTO_RecibirLotExtendido[K]
  ) => {
    setGroupedItems((prev) => {
      const newGrouped = [...prev];
      const group = { ...newGrouped[groupIndex] };
      const lots = [...group.lots];
      let finalValue = value;

      if (field === "cantidad_base") {
        const numVal = Number(value) || 0;
        const otherLotsSum = lots.reduce((acc, l, idx) => {
          if (idx === lotIndex) return acc;
          return acc + (Number(l.cantidad_base) || 0);
        }, 0);

        const remaining = Math.max(0, group.total_entregado_base - otherLotsSum);
        finalValue = Math.min(numVal, remaining) as DTO_RecibirLotExtendido[K];
      }

      lots[lotIndex] = { ...lots[lotIndex], [field]: finalValue };

      if (field === "id_unidad_medida") {
        const selectedU = unidades.find((u) => u.id_unidad_medida === Number(finalValue));
        if (selectedU?.abreviatura === group.unidad_base_abv) {
          lots[lotIndex].contenido_por_presentacion = 1;
        }
      }

      group.lots = lots;
      newGrouped[groupIndex] = group;

      // Limpieza de errores
      const currentSum = group.lots.reduce((acc, l) => acc + (Number(l.cantidad_base) || 0), 0);
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
      const g = newGrouped[groupIndex];
      const lastLot = g.lots[g.lots.length - 1];
      newGrouped[groupIndex] = {
        ...g,
        lots: [
          ...g.lots,
          {
            ...lastLot,
            cantidad_base: 0,
            id_lote_existente: null,
            ajustes: {},
            es_nuevo_lote: true,
          },
        ],
      };
      return newGrouped;
    });
  };

  const removeLot = (groupIndex: number, lotIndex: number) => {
    setGroupedItems((prev) => {
      if (prev[groupIndex].lots.length <= 1) return prev;
      const newGrouped = [...prev];
      const lots = [...newGrouped[groupIndex].lots];
      lots.splice(lotIndex, 1);
      
      // Si solo queda un lote, forzar la cantidad total
      if (lots.length === 1) {
          lots[0].cantidad_base = newGrouped[groupIndex].total_entregado_base;
          // Si es existente, actualizar ajustes
          if (!lots[0].es_nuevo_lote && lots[0].id_lote_existente) {
              lots[0].ajustes = { [lots[0].id_lote_existente]: lots[0].cantidad_base };
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
    qty?: number
  ) => {
    setGroupedItems((prev) => {
      const newGrouped = [...prev];
      const group = { ...newGrouped[groupIndex] };
      const lots = [...group.lots];
      const lot = { ...lots[lotIndex] };

      // Selección ÚNICA por partida (Radio behavior)
      const ajustes: Record<number, number> = {};

      if (isActive) {
        let finalQty = qty;

        if (finalQty === undefined) {
           // Si no viene qty (primer click el radio), calculamos el remanente
           // o si es la única partida, el total.
           if (lots.length === 1) {
              finalQty = group.total_entregado_base;
           } else {
              const otherLotsSum = lots.reduce((acc, l, idx) => {
                if (idx === lotIndex) return acc;
                return acc + (Number(l.cantidad_base) || 0);
              }, 0);
              finalQty = Math.max(0, group.total_entregado_base - otherLotsSum);
           }
        }

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


  const getLotError = (groupIndex: number, lotIndex: number, field: keyof DTO_RecibirLotExtendido) => {
    return errors[`groups.${groupIndex}.lots.${lotIndex}.${field}`] || null;
  };

  const fetchLotesProducto = useCallback(
    async (idProducto: number): Promise<RES_LoteRecepcion[]> => {
      try {
        const res = await ReabastecimientoService.getLotesDestino(
          idAlmacenSolicitante,
          [idProducto]
        );
        return res.success && res.data ? res.data : [];
      } catch {
        notifyError("Error al cargar lotes.");
        return [];
      }
    },
    [idAlmacenSolicitante, notifyError]
  );

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
          newErrors[`groups.${gIdx}.lots.${lIdx}.cantidad_base`] = "Debe ser mayor a 0.";
          hasErrors = true;
        }

        if (!lot.es_nuevo_lote && (!lot.ajustes || Object.keys(lot.ajustes).length === 0)) {
          newErrors[`groups.${gIdx}.lots.${lIdx}.id_lote_existente`] = "Seleccione al menos un lote.";
          hasErrors = true;
        }
        if (lot.es_nuevo_lote && !lot.fecha_ingreso) {
          newErrors[`groups.${gIdx}.lots.${lIdx}.fecha_ingreso`] = "Requerido.";
          hasErrors = true;
        }
        if (lot.es_nuevo_lote && group.es_perecible === 1 && !lot.fecha_vencimiento) {
          newErrors[`groups.${gIdx}.lots.${lIdx}.fecha_vencimiento`] = "Requerido.";
          hasErrors = true;
        }
      });

      if (Math.abs(sumBase - group.total_entregado_base) > 0.0001) {
        newErrors[`groups.${gIdx}.cantidad_total`] = `La suma no coincide (${formatNumber(sumBase)}/${formatNumber(group.total_entregado_base)}).`;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      notifyError("Revise las cantidades.");
      return;
    }

    setLoadingAction(true);
    try {
      const recepcionesMap: Record<number, DTO_RecibirEntregaItem[]> = {};
      groupedItems.forEach((group) => {
        let detIdx = 0;
        let detRemaining = Number(group.detalles_origen[detIdx].cantidad_base);

        const flatLots: DTO_RecibirEntregaItem[] = [];
        group.lots.forEach(lot => {
          if (lot.es_nuevo_lote || !lot.ajustes || Object.keys(lot.ajustes).length === 0) {
            flatLots.push(lot as DTO_RecibirEntregaItem);
          } else {
            Object.entries(lot.ajustes).forEach(([idLote, qty]) => {
              const cleanLot = { ...lot };
              delete (cleanLot as any).ajustes;
              flatLots.push({
                ...cleanLot,
                id_lote_existente: Number(idLote),
                cantidad_base: qty,
              } as DTO_RecibirEntregaItem);
            });
          }
        });

        flatLots.forEach((lot) => {
          let lotRemaining = Number(lot.cantidad_base);
          if (lotRemaining <= 0) return;
          while (lotRemaining > 0 && detIdx < group.detalles_origen.length) {
            const amount = Math.min(lotRemaining, detRemaining);
            const parentId = group.detalles_origen[detIdx].id_reabastecimiento_entrega;
            if (!recepcionesMap[parentId]) recepcionesMap[parentId] = [];
            recepcionesMap[parentId].push({ ...lot, cantidad_base: amount });
            lotRemaining -= amount;
            detRemaining -= amount;
            if (detRemaining <= 0.0001) {
              detIdx++;
              if (detIdx < group.detalles_origen.length) {
                detRemaining = Number(group.detalles_origen[detIdx].cantidad_base);
              }
            }
          }
          if (lotRemaining > 0) {
            const lastDet = group.detalles_origen[group.detalles_origen.length - 1];
            const items = recepcionesMap[lastDet.id_reabastecimiento_entrega];
            if (items && items.length > 0) {
              items[items.length - 1].cantidad_base = Number(items[items.length - 1].cantidad_base) + lotRemaining;
            }
          }
        });
      });

      const recepciones = Object.entries(recepcionesMap).map(([id, items]) => {
        const idNum = Number(id);
        const firstDetail = detalles.find(
          (d) => d.id_reabastecimiento_entrega === idNum,
        );
        return {
          id_reabastecimiento_entrega: idNum,
          tipo_entrega: firstDetail?.tipo_entrega || "Solicitud",
          items,
        };
      });

      const res = await ReabastecimientoService.recibirEntregaBulk({ recepciones });
      if (res.success) {
        notifySuccess("Recepción registrada correctamente.");
        onSuccess();
      } else {
        notifyError(res.message || "Error al registrar.");
      }
    } catch {
      notifyError("Error de conexión.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Validación reactiva
  const isFormValid = groupedItems.every((group) => {
    const sumBase = group.lots.reduce((acc, l) => acc + (Number(l.cantidad_base) || 0), 0);
    const sumMatch = Math.abs(sumBase - group.total_entregado_base) < 0.0001;
    
    const lotsValid = group.lots.every((lot) => {
      if (lot.cantidad_base <= 0) return false;
      if (lot.es_nuevo_lote) {
        if (!lot.fecha_ingreso) return false;
        if (group.es_perecible === 1 && !lot.fecha_vencimiento) return false;
      } else {
        if (!lot.id_lote_existente || !lot.ajustes || Object.keys(lot.ajustes).length === 0) return false;
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
    fetchLotesProducto,
    handleSubmit,
    unidades,
    loadingUnidades,
    errors,
    isFormValid,
  };
};
