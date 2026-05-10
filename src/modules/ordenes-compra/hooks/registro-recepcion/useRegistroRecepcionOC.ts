import { useState, useMemo } from "react";
import dayjs from "dayjs";
import { useNotify } from "../../../../hooks/useNotify";
import { usePrint } from "../../../../hooks/usePrint";
import { type DTO_RecepcionOCItem } from "../../service/recepcion.requests";
import type { RES_TicketLote } from "../../../../service/responses/lote-producto";
import type {
  RES_OrdenCompra,
  RES_OrdenCompraDetalle,
} from "../../../../service/responses/ordenes-compra/orden-compra";
import { OrdenCompraService } from "../../service/orden-compra.service";

import { useAlmacenesRecepcion } from "./useAlmacenesRecepcion";
import { useHeaderRecepcion } from "./useHeaderRecepcion";
import { useItemsRecepcion } from "./useItemsRecepcion";
import { useComprobanteRecepcion } from "./useComprobanteRecepcion";

// Re-exportar interfaces para mantener compatibilidad con componentes que las consumen
export type {
  GroupedReceptionOC,
  DTO_RecepcionLotExtendido,
} from "./useItemsRecepcion";

interface UseRegistroRecepcionOCProps {
  orden: RES_OrdenCompra;
  detalles: RES_OrdenCompraDetalle[];
  soloAutorizados?: boolean;
  onSuccess: (
    lotesNuevos?: RES_TicketLote[],
    finalItems?: DTO_RecepcionOCItem[],
  ) => void;
}

export const useRegistroRecepcionOC = ({
  orden,
  detalles,
  soloAutorizados = true,
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
  } = useAlmacenesRecepcion(soloAutorizados);

  const header = useHeaderRecepcion();
  const items = useItemsRecepcion({ selectedAlmacenId, detalles });
  const comprobante = useComprobanteRecepcion(orden);

  const [loadingAction, setLoadingAction] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orden?.id_orden_compra || !selectedAlmacenId) return;

    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    const selectedGroups = items.groupedItems.filter((g) => g.selected);
    if (selectedGroups.length === 0) {
      notifyError("Debe seleccionar al menos un producto para recibir.");
      return;
    }

    // Validaciones detalladas por producto
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

        if (lot.es_nuevo_lote) {
          if (!lot.fecha_ingreso) {
            newErrors[`groups.${gIdx}.lots.${lIdx}.fecha_ingreso`] =
              "Fecha requerida.";
            hasErrors = true;
          }
        } else {
          if (!lot.id_lote_existente) {
            notifyError(`Seleccione un lote para ${group.producto}`);
            hasErrors = true;
          }
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
      notifyError("Revise los datos marcados en rojo.");
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
                fecha_vencimiento: lot.fecha_vencimiento
                  ? dayjs(lot.fecha_vencimiento).format("YYYY-MM-DD")
                  : null,
                fecha_ingreso: dayjs(lot.fecha_ingreso).format(
                  "YYYY-MM-DD HH:mm:ss",
                ),
              });
            });
          } else {
            finalItems.push({
              id_orden_compra_detalle: lot.id_orden_compra_detalle,
              cantidad_base: lot.cantidad_base,
              es_nuevo_lote: lot.es_nuevo_lote,
              id_lote_existente: lot.id_lote_existente,
              descripcion: lot.descripcion,
              fecha_vencimiento: lot.fecha_vencimiento
                ? dayjs(lot.fecha_vencimiento).format("YYYY-MM-DD")
                : null,
              fecha_ingreso: dayjs(lot.fecha_ingreso).format(
                "YYYY-MM-DD HH:mm:ss",
              ),
            });
          }
        });
      });

      const res = await OrdenCompraService.registrarRecepcion(
        {
          id_orden_compra: orden.id_orden_compra,
          id_almacen_recepcionista: selectedAlmacenId!,
          con_incidencia: header.conIncidencia,
          observacion: header.observacion,
          fecha_hora_recepcion: dayjs(
            header.fechaHoraRecepcion || new Date(),
          ).format("YYYY-MM-DD HH:mm:ss"),
          serie_guia: header.serieGuia,
          numero_guia: header.numeroGuia,
          items: finalItems,
          comprobante: comprobante.incluirComprobante
            ? {
                tipo_comprobante: comprobante.tipoComprobante,
                serie: comprobante.serie,
                numero: comprobante.numero,
                fecha_emision: dayjs(
                  comprobante.fechaEmision || new Date(),
                ).format("YYYY-MM-DD"),
                observacion: comprobante.observacion,
                evidencias: comprobante.evidencias,
                moneda: comprobante.moneda,
                tipo_cambio_venta_aplicado: comprobante.tipoCambio,
                es_auditable: comprobante.esAuditable,
                total_antes_igv: comprobante.totalAntesIgv,
                total_antes_igv_soles: comprobante.total_antes_igv_soles,
                incluye_igv: comprobante.incluyeIgv,
                porcentaje_igv: comprobante.porcentajeIgv,
                monto_igv: comprobante.montoIgv,
                monto_igv_soles: comprobante.monto_igv_soles,
                total_despues_igv: comprobante.totalDespuesIgv,
                total_despues_igv_soles: comprobante.total_despues_igv_soles,
              }
            : undefined,
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
    // Validamos solo lo esencial para permitir el click y dar feedback con notificaciones
    const hasWarehouse = !!selectedAlmacenId;
    const hasDate = !!header.fechaHoraRecepcion;
    const hasSelectedItems = items.groupedItems.some((g) => g.selected);

    return hasWarehouse && hasDate && hasSelectedItems;
  }, [selectedAlmacenId, header.fechaHoraRecepcion, items.groupedItems]);

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

    // Comprobante
    comprobante,

    // Acciones y Estado de Carga
    loadingAction,
    handleSubmit,
    isFormValid,
  };
};
