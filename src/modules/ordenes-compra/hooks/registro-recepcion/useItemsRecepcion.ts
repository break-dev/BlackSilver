import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import type { RES_OrdenCompraDetalle } from "../../../../service/responses/ordenes-compra/orden-compra";
import type { RES_LoteDisponible } from "../../../../service/responses/lote-producto";
import { type DTO_RecepcionOCItem } from "../../service/recepcion.requests";
import { AuxService } from "../../../../service/auxiliar.service";
import { TipoBien } from "../../../../shared/enums/_generic/tipo-bien";

export interface DTO_RecepcionLotExtendido extends DTO_RecepcionOCItem {
  ajustes?: Record<number, number>; // idLote -> cantidad
  es_perecible: boolean;
}

export interface GroupedReceptionOC {
  id_orden_compra_detalle: number;
  almacen_recepcionista: string;
  producto: string;
  cantidad_requerida_base: number;
  unidad_base_abv: string;
  unidad_oc_abv: string;
  id_unidad_oc: number;
  es_perecible: boolean;
  id_producto: number;
  tipo_bien: string;
  id_mina_destino: number | null;
  mina_destino: string | null;
  id_almacen_destino: number | null;
  id_unidad_medida_base: number;
  contenido_por_presentacion_oc: number;
  selected: boolean;
  lots: DTO_RecepcionLotExtendido[];
}

interface UseItemsRecepcionProps {
  selectedAlmacenId: number | null;
  detalles: RES_OrdenCompraDetalle[];
}

export const useItemsRecepcion = ({
  selectedAlmacenId,
  detalles,
}: UseItemsRecepcionProps) => {
  const [groupedItems, setGroupedItems] = useState<GroupedReceptionOC[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lotesDisponibles, setLotesDisponibles] = useState<
    RES_LoteDisponible[]
  >([]);
  const [loadingLotes, setLoadingLotes] = useState(false);

  // Patrón para ajustar estado basado en props/deps durante el render (evita cascading renders)
  const [prevAlmacenId, setPrevAlmacenId] = useState(selectedAlmacenId);
  const [prevDetalles, setPrevDetalles] = useState(detalles);

  const getInitialGroupedItems = useCallback(
    (details: RES_OrdenCompraDetalle[]): GroupedReceptionOC[] => {
      const pendingDetails = details.filter((d) => {
        const req = Number(d.cantidad_requerida_base || 0);
        const rec = Number(d.cantidad_recepcionada_base || 0);
        return rec < req - 0.001;
      });

      const firstItem = pendingDetails[0];
      const targetIsAsset = firstItem ? firstItem.tipo_bien === TipoBien.ActivoFijo : false;

      return pendingDetails.map((d) => ({
        id_orden_compra_detalle: d.id_orden_compra_detalle,
        almacen_recepcionista: d.almacen_recepcionista,
        producto: d.producto,
        cantidad_requerida_base:
          Number(d.cantidad_requerida_base || 0) -
          Number(d.cantidad_recepcionada_base || 0),
        unidad_base_abv: d.unidad_medida_base_abv,
        unidad_oc_abv: d.unidad_medida_oc_abv,
        id_unidad_oc: d.id_unidad_medida_oc,
        es_perecible: !!d.es_perecible,
        id_producto: d.id_producto,
        tipo_bien: d.tipo_bien,
        id_mina_destino: d.id_mina_destino,
        mina_destino: d.mina_destino,
        id_almacen_destino: d.id_almacen_recepcionista,
        id_unidad_medida_base: d.id_unidad_medida_base,
        contenido_por_presentacion_oc: d.contenido_por_presentacion,
        selected: d.tipo_bien === TipoBien.ActivoFijo ? targetIsAsset : !targetIsAsset,
        lots:
          d.tipo_bien === TipoBien.ActivoFijo
            ? [
                {
                  id_orden_compra_detalle: d.id_orden_compra_detalle,
                  cantidad_base: 1,
                  es_nuevo_lote: false,
                  id_lote_existente: null,
                  fecha_ingreso: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                  fecha_vencimiento: null,
                  descripcion: null,
                  es_perecible: false,
                  ajustes: {},
                  es_activo_fijo: true,
                  id_almacen_destino: d.id_almacen_recepcionista,
                  id_mina_destino: null,
                  codigo: "",
                  numero_serie: "",
                  modelo: "",
                  id_marca: null,
                  yearcito_modelo: null,
                  descripcion_activo: "",
                },
              ]
            : [
                {
                  id_orden_compra_detalle: d.id_orden_compra_detalle,
                  cantidad_base:
                    Number(d.cantidad_requerida_base || 0) -
                    Number(d.cantidad_recepcionada_base || 0),
                  es_nuevo_lote: false,
                  id_lote_existente: null,
                  fecha_ingreso: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                  fecha_vencimiento: null,
                  descripcion: null,
                  es_perecible: !!d.es_perecible,
                  ajustes: {},
                },
              ],
      }));
    },
    [],
  );
  if (selectedAlmacenId !== prevAlmacenId || detalles !== prevDetalles) {
    setPrevAlmacenId(selectedAlmacenId);
    setPrevDetalles(detalles);
    setGroupedItems(getInitialGroupedItems(detalles));
    setErrors({});
    setLoadingLotes(true);
    setLotesDisponibles([]);
  }

  useEffect(() => {
    if (selectedAlmacenId && detalles.length > 0) {
      const itemsConLote = detalles.filter(
        (d) => d.tipo_bien !== TipoBien.ActivoFijo,
      );
      const ids = Array.from(new Set(itemsConLote.map((d) => d.id_producto)));
      if (ids.length === 0) return;
      AuxService.get_lotes_disponibles(selectedAlmacenId, ids)
        .then((res) => {
          if (res.success && res.data) {
            setLotesDisponibles(res.data);
            setGroupedItems((prev) =>
              prev.map((group) => {
                const productLots = res.data!.filter(
                  (l) => l.id_producto === group.id_producto,
                );

                // Caso 1: No hay lotes -> Forzar "Nuevo Lote"
                if (productLots.length === 0) {
                  return {
                    ...group,
                    lots: group.lots.map((lot) => ({
                      ...lot,
                      es_nuevo_lote: true,
                      fecha_ingreso:
                        lot.fecha_ingreso ||
                        dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    })),
                  };
                }

                // Caso 2: Hay lotes -> Auto-seleccionar el primero para "Ajustar Stock"
                // Sólo si el lote actual no ha sido modificado manualmente
                return {
                  ...group,
                  lots: group.lots.map((lot) => {
                    if (!lot.es_nuevo_lote && !lot.id_lote_existente) {
                      const firstLot = productLots[0];
                      return {
                        ...lot,
                        id_lote_existente: firstLot.id_lote,
                        ajustes: { [firstLot.id_lote]: lot.cantidad_base },
                        fecha_ingreso:
                          lot.fecha_ingreso ||
                          dayjs().format("YYYY-MM-DD HH:mm:ss"),
                      };
                    }
                    return lot;
                  }),
                };
              }),
            );
          }
        })
        .finally(() => setLoadingLotes(false));
    }
  }, [selectedAlmacenId, detalles]);

  const toggleSelection = (index: number) => {
    setGroupedItems((prev) => {
      const targetItem = prev[index];
      const nextSelected = !targetItem.selected;
      const targetIsAsset = targetItem.tipo_bien === TipoBien.ActivoFijo;

      return prev.map((item, idx) => {
        if (idx === index) {
          return { ...item, selected: nextSelected };
        }

        if (nextSelected) {
          const isAsset = item.tipo_bien === TipoBien.ActivoFijo;
          if (isAsset !== targetIsAsset) {
            return { ...item, selected: false };
          }
        }

        return item;
      });
    });
  };

  const setLotValue = <K extends keyof DTO_RecepcionLotExtendido>(
    groupIndex: number,
    lotIndex: number,
    field: K,
    value: DTO_RecepcionLotExtendido[K],
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
          group.cantidad_requerida_base,
        ) as unknown as DTO_RecepcionLotExtendido[K];
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

      if (g.tipo_bien === TipoBien.ActivoFijo) {
        if (lots.length >= g.cantidad_requerida_base) {
          return prev;
        }
        lots.push({
          id_orden_compra_detalle: g.id_orden_compra_detalle,
          cantidad_base: 1,
          es_nuevo_lote: false,
          id_lote_existente: null,
          fecha_ingreso: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          fecha_vencimiento: null,
          descripcion: null,
          es_perecible: false,
          ajustes: {},
          es_activo_fijo: true,
          id_almacen_destino: g.id_almacen_destino,
          id_mina_destino: g.id_mina_destino,
          codigo: "",
          numero_serie: "",
          modelo: "",
          id_marca: null,
          yearcito_modelo: new Date().getFullYear(),
          descripcion_activo: "",
        });
      } else {
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
      }

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
        const finalQty = qty ?? group.cantidad_requerida_base;
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
    field: keyof DTO_RecepcionLotExtendido,
  ) => {
    return errors[`groups.${groupIndex}.lots.${lotIndex}.${field}`] || null;
  };

  return {
    groupedItems,
    setGroupedItems,
    errors,
    setErrors,
    lotesDisponibles,
    loadingLotes,
    toggleSelection,
    setLotValue,
    addLot,
    removeLot,
    updateTabularAdjustment,
    getLotError,
  };
};
