import { useState, useMemo } from "react";
import { useNotify } from "../../../../hooks/useNotify";
import { usePrint } from "../../../../hooks/usePrint";
import { type DTO_RecepcionOCItem } from "../../service/recepcion.requests";
import type { RES_TicketLote } from "../../../../service/responses/lote-producto";
import type { RES_OrdenCompraDetalle } from "../../../../service/responses/ordenes-compra/orden-compra";
import { OrdenCompraService } from "../../service/orden-compra.service";

import { useAlmacenesRecepcion } from "./useAlmacenesRecepcion";
import { useHeaderRecepcion } from "./useHeaderRecepcion";
import { useItemsRecepcion } from "./useItemsRecepcion";

// Re-exportar interfaces para mantener compatibilidad con componentes que las consumen
export type {
  GroupedReceptionOC,
  DTO_RecepcionLotExtendido,
} from "./useItemsRecepcion";

interface UseRegistroRecepcionOCProps {
  idOrdenCompra: number;
  detalles: RES_OrdenCompraDetalle[];
  onSuccess: (
    lotesNuevos?: RES_TicketLote[],
    finalItems?: DTO_RecepcionOCItem[],
  ) => void;
}

export const useRegistroRecepcionOC = ({
  idOrdenCompra,
  detalles,
  onSuccess,
}: UseRegistroRecepcionOCProps) => {
  const { notifySuccess, notifyError } = useNotify();
  const { prepare } = usePrint();

  // Sub-hooks
  const {
    almacenes,
    loadingAlmacenes,
    selectedAlmacenId,
    setSelectedAlmacenId,
  } = useAlmacenesRecepcion();

  const header = useHeaderRecepcion();
  const items = useItemsRecepcion({ selectedAlmacenId, detalles });

  const [loadingAction, setLoadingAction] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idOrdenCompra || !selectedAlmacenId) return;

    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    const selectedGroups = items.groupedItems.filter((g) => g.selected);
    if (selectedGroups.length === 0) {
      notifyError("Debe seleccionar al menos un producto para recibir.");
      return;
    }

    selectedGroups.forEach((group) => {
      const gIdx = items.groupedItems.indexOf(group);
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

    if (
      header.conIncidencia &&
      (!header.observacion.trim() || header.evidencias.length === 0)
    ) {
      notifyError("Complete los datos de la incidencia.");
      return;
    }

    if (hasErrors) {
      items.setErrors(newErrors);
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
          con_incidencia: header.conIncidencia,
          observacion: header.observacion,
          fecha_hora_recepcion:
            header.fechaHoraRecepcion?.toISOString() ||
            new Date().toISOString(),
          serie_guia: header.serieGuia,
          numero_guia: header.numeroGuia,
          items: finalItems,
        },
        header.evidencias,
      );

      if (res.success) {
        notifySuccess("Recepción registrada.");
        onSuccess(res.data ?? undefined, finalItems);
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
    if (!selectedAlmacenId || !header.fechaHoraRecepcion) return false;
    if (
      header.conIncidencia &&
      (!header.observacion.trim() || header.evidencias.length === 0)
    )
      return false;

    const selectedGroups = items.groupedItems.filter((g) => g.selected);
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
          if (!lot.fecha_ingreso) {
            allValid = false;
            break;
          }
          if (group.es_perecible && !lot.fecha_vencimiento) {
            allValid = false;
            break;
          }
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
  }, [selectedAlmacenId, header, items.groupedItems]);

  return {
    // Almacenes
    almacenes,
    loadingAlmacenes,
    selectedAlmacenId,
    setSelectedAlmacenId,

    // Items/Productos
    ...items,

    // Header/Cabecera
    ...header,

    // Acciones y Estado de Carga
    loadingAction,
    handleSubmit,
    isFormValid,
  };
};
