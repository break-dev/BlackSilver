import { useState, useEffect, useMemo } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { usePrint } from "../../../hooks/usePrint";
import { type DTO_RecepcionOCItem } from "../service/recepcion.requests";
import type { RES_Almacen } from "../../almacenes/service/almacenes.responses";
import type {
  RES_LoteDisponible,
  RES_TicketLote,
} from "../../../service/responses/lote-producto";
import type { RES_OrdenCompraDetalle } from "../../../service/responses/ordenes-compra/orden-compra";
import { OrdenCompraService } from "../service/orden-compra.service";

export interface DTO_RecepcionLotExtendido extends DTO_RecepcionOCItem {
  ajustes?: Record<number, number>; // idLote -> cantidad
  es_perecible: boolean;
}

export interface GroupedReceptionOC {
  id_orden_compra_detalle: number;
  producto: string;
  cantidad_requerida_base: number;
  unidad_base_abv: string;
  unidad_oc_abv: string;
  id_unidad_oc: number;
  es_perecible: boolean;
  id_producto: number;
  id_unidad_medida_base: number;
  contenido_por_presentacion_oc: number;
  selected: boolean;
  lots: DTO_RecepcionLotExtendido[];
}

interface UseRegistroRecepcionOCProps {
  idOrdenCompra: number;
  detalles: RES_OrdenCompraDetalle[];
  onSuccess: (lotesNuevos?: RES_TicketLote[]) => void;
}

export const useRegistroRecepcionOC = ({
  idOrdenCompra,
  detalles,
  onSuccess,
}: UseRegistroRecepcionOCProps) => {
  const { notifySuccess, notifyError } = useNotify();
  const { prepare } = usePrint();

  const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);
  const [selectedAlmacenId, setSelectedAlmacenId] = useState<number | null>(
    null,
  );

  const [groupedItems, setGroupedItems] = useState<GroupedReceptionOC[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingAction, setLoadingAction] = useState(false);

  // Estados para cabecera de recepción
  const [fechaHoraRecepcion, setFechaHoraRecepcion] = useState<Date | null>(
    new Date(),
  );
  const [conIncidencia, setConIncidencia] = useState(false);
  const [observacion, setObservacion] = useState("");
  const [evidencias, setEvidencias] = useState<File[]>([]);
  const [serieGuia, setSerieGuia] = useState("");
  const [numeroGuia, setNumeroGuia] = useState("");

  const [lotesDisponibles, setLotesDisponibles] = useState<
    RES_LoteDisponible[]
  >([]);
  const [loadingLotes, setLoadingLotes] = useState(false);

  // 1. Cargar Almacenes (Aislado vía OrdenCompraService)
  useEffect(() => {
    setLoadingAlmacenes(true);
    OrdenCompraService.getAlmacenes()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setAlmacenes(res.data);
          setSelectedAlmacenId(res.data[0].id_almacen);
        }
      })
      .finally(() => setLoadingAlmacenes(false));
  }, []);

  // 2. Inicializar groupedItems
  useEffect(() => {
    if (detalles && detalles.length > 0 && groupedItems.length === 0) {
      const initial: GroupedReceptionOC[] = detalles
        .filter((d) => {
          const req = Number(d.cantidad_requerida_base || 0);
          const rec = Number(d.cantidad_recepcionada_base || 0);
          return rec < req - 0.001;
        })
        .map((d) => ({
        id_orden_compra_detalle: d.id_orden_compra_detalle,
        producto: d.producto,
        cantidad_requerida_base: Number(d.cantidad_requerida_base || 0) - Number(d.cantidad_recepcionada_base || 0),
        unidad_base_abv: d.unidad_medida_base_abv,
        unidad_oc_abv: d.unidad_medida_oc_abv,
        id_unidad_oc: d.id_unidad_medida_oc,
        es_perecible: !!d.es_perecible,
        id_producto: d.id_producto,
        id_unidad_medida_base: d.id_unidad_medida_base,
        contenido_por_presentacion_oc: d.contenido_por_presentacion,
        selected: true,
        lots: [
          {
            id_orden_compra_detalle: d.id_orden_compra_detalle,
            cantidad_base: Number(d.cantidad_requerida_base || 0) - Number(d.cantidad_recepcionada_base || 0),
            es_nuevo_lote: false,
            id_lote_existente: null,
            fecha_ingreso: new Date().toISOString(),
            fecha_vencimiento: null,
            descripcion: null,
            es_perecible: !!d.es_perecible,
            ajustes: {},
          },
        ],
      }));
      setGroupedItems(initial);
    }
  }, [detalles, groupedItems.length]);

  // 3. Cargar Lotes cuando cambia el almacén (Aislado vía OrdenCompraService)
  useEffect(() => {
    if (selectedAlmacenId && detalles.length > 0) {
      const ids = Array.from(new Set(detalles.map((d) => d.id_producto)));
      setLoadingLotes(true);
      OrdenCompraService.getLotesParaRecepcion(selectedAlmacenId, ids)
        .then((res) => {
          if (res.success && res.data) {
            setLotesDisponibles(res.data);

            // Si el producto no tiene lotes en el almacén seleccionado, cambiar a "Nuevo Lote"
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
  }, [selectedAlmacenId, detalles]);

  const toggleSelection = (index: number) => {
    setGroupedItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], selected: !copy[index].selected };
      return copy;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idOrdenCompra || !selectedAlmacenId) return;

    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    const selectedGroups = groupedItems.filter((g) => g.selected);
    if (selectedGroups.length === 0) {
      notifyError("Debe seleccionar al menos un producto para recibir.");
      return;
    }

    selectedGroups.forEach((group) => {
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
      if (sumBase > group.cantidad_requerida_base + 0.001) {
        newErrors[`groups.${gIdx}.cantidad_total`] =
          "La suma supera el total requerido.";
        hasErrors = true;
      }
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

    const tieneLotesImprimibles = selectedGroups.some((g) =>
      g.lots.some((l) => l.es_nuevo_lote),
    );
    let printerWin: Window | null = null;
    if (tieneLotesImprimibles) printerWin = prepare("TicketLotePrinter");

    setLoadingAction(true);
    try {
      const finalItems: DTO_RecepcionOCItem[] = [];
      selectedGroups.forEach((group) => {
        group.lots.forEach((lot) => {
          if (!lot.es_nuevo_lote && lot.ajustes) {
            Object.entries(lot.ajustes).forEach(([idLote, qtyAjuste]) => {
              finalItems.push({
                id_orden_compra_detalle: lot.id_orden_compra_detalle,
                cantidad_base: Number(qtyAjuste),
                es_nuevo_lote: false,
                id_lote_existente: Number(idLote),
                descripcion: lot.descripcion,
                fecha_vencimiento: lot.fecha_vencimiento,
                fecha_ingreso: lot.fecha_ingreso,
              });
            });
          } else {
            finalItems.push({
              id_orden_compra_detalle: lot.id_orden_compra_detalle,
              cantidad_base: lot.cantidad_base,
              es_nuevo_lote: lot.es_nuevo_lote,
              id_lote_existente: lot.id_lote_existente,
              descripcion: lot.descripcion,
              fecha_vencimiento: lot.fecha_vencimiento,
              fecha_ingreso: lot.fecha_ingreso,
            });
          }
        });
      });

      const res = await OrdenCompraService.registrarRecepcion(
        {
          id_orden_compra: idOrdenCompra,
          id_almacen_recepcionista: selectedAlmacenId!,
          con_incidencia: conIncidencia,
          observacion: observacion,
          fecha_hora_recepcion:
            fechaHoraRecepcion?.toISOString() || new Date().toISOString(),
          serie_guia: serieGuia,
          numero_guia: numeroGuia,
          items: finalItems,
        },
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

  const isFormValid = useMemo(() => {
    if (!selectedAlmacenId || !fechaHoraRecepcion) return false;
    if (conIncidencia && (!observacion.trim() || evidencias.length === 0)) return false;

    const selectedGroups = groupedItems.filter((g) => g.selected);
    if (selectedGroups.length === 0) return false;

    let allValid = true;
    for (const group of selectedGroups) {
      let sumBase = 0;
      for (const lot of group.lots) {
        const cant = Number(lot.cantidad_base) || 0;
        if (cant <= 0) {
          allValid = false;
          break;
        }
        sumBase += cant;
        if (lot.es_nuevo_lote) {
           if (!lot.fecha_ingreso) { allValid = false; break; }
           if (group.es_perecible && !lot.fecha_vencimiento) { allValid = false; break; }
        }
      }
      if (!allValid) break;

      const maxReq = Number(group.cantidad_requerida_base) || 0;
      if (sumBase > maxReq + 0.001) {
        allValid = false;
        break;
      }
    }

    return allValid;
  }, [groupedItems, selectedAlmacenId, fechaHoraRecepcion, conIncidencia, observacion, evidencias]);

  return {
    almacenes,
    loadingAlmacenes,
    selectedAlmacenId,
    setSelectedAlmacenId,
    groupedItems,
    toggleSelection,
    setLotValue,
    addLot,
    removeLot,
    updateTabularAdjustment,
    getLotError,
    loadingAction,
    handleSubmit,
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
    serieGuia,
    setSerieGuia,
    numeroGuia,
    setNumeroGuia,
    lotesDisponibles,
    loadingLotes,
  };
};
