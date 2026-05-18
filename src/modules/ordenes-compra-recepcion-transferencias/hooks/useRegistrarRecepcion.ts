import { useState, useEffect, useMemo } from "react";
import { useNotify } from "../../../hooks/useNotify";
import type { RES_LoteDisponible } from "../../../service/responses/lote-producto";
import type { RES_OCTransferenciaDetalle } from "../../../service/responses/ordenes-compra/orden-compra-transferencia";
import type { DTO_ItemRecepcionTransferencia } from "../service/oc-recepcion-transferencias.requests";
import { OCTransService } from "../service/oc-recepcion-transferencias.service";
import { AuxService } from "../../../service/auxiliar.service";
import { TipoBien } from "../../../shared/enums/_generic/tipo-bien";

// -------------------------------------------------------
// Tipos locales del formulario de recepción
// -------------------------------------------------------

export interface DTO_LoteRecepcionTrans extends DTO_ItemRecepcionTransferencia {
  ajustes?: Record<number, number>;
}

export interface GrupoRecepcionTrans {
  id_detalle_transferencia: number;
  id_producto: number;
  producto: string;
  /** Cantidad total transferida (lo que debe recibirse) en unidad base */
  cantidad_transferida_base: number;
  unidad_medida_base_abv: string;
  unidad_medida_oc_abv: string;
  contenido_por_presentacion_oc: number;
  id_unidad_medida_lot: number;
  contenido_por_presentacion_lot: number;
  tipo_bien: string;
  es_activo_fijo?: boolean;
  id_activo_fijo?: number | null;
  selected: boolean;
  lots: DTO_LoteRecepcionTrans[];
}

interface UseRegistrarRecepcionProps {
  idTransferencia: number;
  idAlmacenRecepcionista: number;
  detalles: RES_OCTransferenciaDetalle[];
  onSuccess: () => void;
}

// -------------------------------------------------------
// Hook
// -------------------------------------------------------

export const useRegistrarRecepcion = ({
  idTransferencia,
  idAlmacenRecepcionista,
  detalles,
  onSuccess,
}: UseRegistrarRecepcionProps) => {
  const { notifySuccess, notifyError } = useNotify();

  const [groupedItems, setGroupedItems] = useState<GrupoRecepcionTrans[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingAction, setLoadingAction] = useState(false);

  // Cabecera de recepción
  const [fechaHoraRecepcion, setFechaHoraRecepcion] = useState<Date | null>(
    new Date(),
  );
  const [conIncidencia, setConIncidencia] = useState(false);
  const [observacion, setObservacion] = useState("");
  const [evidencias, setEvidencias] = useState<File[]>([]);

  // Lotes del almacén destino
  const [lotesDisponibles, setLotesDisponibles] = useState<
    RES_LoteDisponible[]
  >([]);
  const [loadingLotes, setLoadingLotes] = useState(false);

  // 1. Inicializar grupos desde los detalles de la transferencia
  useEffect(() => {
    if (detalles.length > 0 && groupedItems.length === 0) {
      const grupos: GrupoRecepcionTrans[] = detalles.map((d) => ({
        id_detalle_transferencia: d.id_transferencia_detalle,
        id_producto: d.id_producto,
        producto: d.producto,
        cantidad_transferida_base: d.cantidad_transferida_base,
        unidad_medida_base_abv: d.unidad_medida_base_abv,
        unidad_medida_oc_abv: d.unidad_medida_oc_abv,
        contenido_por_presentacion_oc: d.contenido_por_presentacion_oc,
        id_unidad_medida_lot: d.id_unidad_medida_lot,
        contenido_por_presentacion_lot: d.contenido_por_presentacion_lot,
        tipo_bien: d.tipo_bien,
        es_activo_fijo: d.tipo_bien === TipoBien.ActivoFijo,
        id_activo_fijo: d.id_activo_fijo,
        selected: true,
        lots:
          d.tipo_bien === TipoBien.ActivoFijo
            ? []
            : [
                {
                  id_detalle_transferencia: d.id_transferencia_detalle,
                  cantidad_base: d.cantidad_transferida_base,
                  es_nuevo_lote: false,
                  id_lote_existente: null,
                  es_activo_fijo: false,
                  ajustes: {},
                },
              ],
      }));
      setGroupedItems(grupos);
    }
  }, [detalles, groupedItems.length]);

  // 2. Cargar lotes disponibles en el almacén destino
  useEffect(() => {
    if (!idAlmacenRecepcionista || detalles.length === 0) return;
    const itemsConLote = detalles.filter(
      (d) => d.tipo_bien !== TipoBien.ActivoFijo,
    );
    const ids = Array.from(new Set(itemsConLote.map((d) => d.id_producto)));
    if (ids.length === 0) return;

    setLoadingLotes(true);
    AuxService.get_lotes_disponibles(idAlmacenRecepcionista, ids)
      .then((res) => {
        if (res.success && res.data) {
          setLotesDisponibles(res.data);
          // Si el producto no tiene lotes, pasar a nuevo lote automáticamente
          setGroupedItems((prev) =>
            prev.map((g) => {
              const tiene = res.data!.some(
                (l) => l.id_producto === g.id_producto,
              );
              if (!tiene) {
                return {
                  ...g,
                  lots: g.lots.map((l) => ({ ...l, es_nuevo_lote: true })),
                };
              }
              return g;
            }),
          );
        }
      })
      .finally(() => setLoadingLotes(false));
  }, [idAlmacenRecepcionista, detalles]);

  // -------------------------------------------------------
  // Manipulación de items
  // -------------------------------------------------------

  const toggleSelection = (index: number) => {
    setGroupedItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], selected: !copy[index].selected };
      return copy;
    });
  };

  const setLotValue = <K extends keyof DTO_LoteRecepcionTrans>(
    groupIndex: number,
    lotIndex: number,
    field: K,
    value: DTO_LoteRecepcionTrans[K],
  ) => {
    setGroupedItems((prev) => {
      const newGrouped = [...prev];
      const group = { ...newGrouped[groupIndex] };
      const lots = [...group.lots];

      let finalValue = value;
      if (field === "cantidad_base") {
        const numVal = Number(value) || 0;
        finalValue = Math.min(
          numVal,
          group.cantidad_transferida_base,
        ) as unknown as DTO_LoteRecepcionTrans[K];
      }

      lots[lotIndex] = { ...lots[lotIndex], [field]: finalValue };
      group.lots = lots;
      newGrouped[groupIndex] = group;
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

      if (isActive) {
        const finalQty = qty ?? group.cantidad_transferida_base;
        lot.ajustes = { [idLote]: finalQty };
        lot.cantidad_base = finalQty;
        lot.id_lote_existente = idLote;
      } else {
        lot.id_lote_existente = null;
        lot.cantidad_base = 0;
        lot.ajustes = {};
      }

      lots[lotIndex] = lot;
      group.lots = lots;
      newGrouped[groupIndex] = group;
      return newGrouped;
    });
  };

  const getLotError = (
    groupIndex: number,
    lotIndex: number,
    field: keyof DTO_LoteRecepcionTrans,
  ) => errors[`groups.${groupIndex}.lots.${lotIndex}.${field}`] || null;

  // -------------------------------------------------------
  // Submit
  // -------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idTransferencia || !idAlmacenRecepcionista) return;

    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    const selectedGroups = groupedItems.filter((g) => g.selected);
    if (selectedGroups.length === 0) {
      notifyError("Debe seleccionar al menos un producto para recepcionar.");
      return;
    }

    selectedGroups.forEach((group) => {
      if (group.tipo_bien === TipoBien.ActivoFijo) return;

      const gIdx = groupedItems.indexOf(group);
      let sumBase = 0;
      group.lots.forEach((lot, lIdx) => {
        const cant = Number(lot.cantidad_base) || 0;
        sumBase += cant;
        if (cant <= 0) {
          newErrors[`groups.${gIdx}.lots.${lIdx}.cantidad_base`] =
            "Debe ser mayor a 0.";
          hasErrors = true;
        }
      });
      if (sumBase > group.cantidad_transferida_base + 0.001) {
        newErrors[`groups.${gIdx}.cantidad_total`] =
          "La suma supera el total transferido.";
        hasErrors = true;
      }
    });

    if (conIncidencia && !observacion.trim()) {
      notifyError("Con incidencia activa, la observación es obligatoria.");
      return;
    }

    if (hasErrors) {
      setErrors(newErrors);
      notifyError("Revise las cantidades ingresadas.");
      return;
    }

    setLoadingAction(true);
    try {
      const finalItems: DTO_ItemRecepcionTransferencia[] = [];

      selectedGroups.forEach((group) => {
        if (group.tipo_bien === TipoBien.ActivoFijo) {
          finalItems.push({
            id_detalle_transferencia: group.id_detalle_transferencia,
            es_activo_fijo: true,
            id_activo_fijo: group.id_activo_fijo,
            cantidad_base: 1,
            es_nuevo_lote: false,
            id_lote_existente: null,
          });
          return;
        }

        group.lots.forEach((lot) => {
          if (!lot.es_nuevo_lote && lot.ajustes) {
            Object.entries(lot.ajustes).forEach(([idLote, qty]) => {
              finalItems.push({
                id_detalle_transferencia: lot.id_detalle_transferencia,
                cantidad_base: Number(qty),
                es_nuevo_lote: false,
                id_lote_existente: Number(idLote),
                es_activo_fijo: false,
                descripcion: lot.descripcion,
                fecha_ingreso: lot.fecha_ingreso,
                fecha_vencimiento: lot.fecha_vencimiento,
              });
            });
          } else {
            finalItems.push({
              id_detalle_transferencia: lot.id_detalle_transferencia,
              cantidad_base: lot.cantidad_base,
              es_nuevo_lote: lot.es_nuevo_lote,
              id_lote_existente: lot.id_lote_existente,
              es_activo_fijo: false,
              descripcion: lot.descripcion,
              fecha_ingreso: lot.fecha_ingreso,
              fecha_vencimiento: lot.fecha_vencimiento,
            });
          }
        });
      });

      const res = await OCTransService.registrarRecepcion(
        {
          id_transferencia: idTransferencia,
          id_almacen_recepcionista: idAlmacenRecepcionista,
          con_incidencia: conIncidencia,
          observacion,
          fecha_hora_recepcion:
            fechaHoraRecepcion?.toISOString() ?? new Date().toISOString(),
          items: finalItems,
        },
        evidencias,
      );

      if (res.success) {
        notifySuccess("Recepción registrada exitosamente.");
        onSuccess();
      } else {
        notifyError(res.message || "Error al registrar la recepción.");
      }
    } catch {
      notifyError("Error de conexión al registrar la recepción.");
    } finally {
      setLoadingAction(false);
    }
  };

  const isFormValid = useMemo(() => {
    if (!idAlmacenRecepcionista || !fechaHoraRecepcion) return false;
    if (conIncidencia && !observacion.trim()) return false;

    const selected = groupedItems.filter((g) => g.selected);
    if (selected.length === 0) return false;

    for (const group of selected) {
      if (group.tipo_bien === TipoBien.ActivoFijo) continue;

      let sumBase = 0;
      for (const lot of group.lots) {
        const cant = Number(lot.cantidad_base) || 0;
        if (cant <= 0) return false;
        sumBase += cant;
        if (lot.es_nuevo_lote && !lot.fecha_ingreso) return false;
      }
      if (sumBase > group.cantidad_transferida_base + 0.001) return false;
    }

    return true;
  }, [
    groupedItems,
    idAlmacenRecepcionista,
    fechaHoraRecepcion,
    conIncidencia,
    observacion,
  ]);

  return {
    groupedItems,
    errors,
    loadingAction,
    fechaHoraRecepcion,
    setFechaHoraRecepcion,
    conIncidencia,
    setConIncidencia,
    observacion,
    setObservacion,
    evidencias,
    setEvidencias,
    lotesDisponibles,
    loadingLotes,
    toggleSelection,
    setLotValue,
    addLot,
    removeLot,
    updateTabularAdjustment,
    getLotError,
    handleSubmit,
    isFormValid,
  };
};
