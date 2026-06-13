import { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import { AuxService } from "../../../../service/auxiliar.service";
import type { RES_Marca } from "../../../../service/responses/marca";
import type { RES_Mina } from "../../../../service/responses/mina";
import { useNotify } from "../../../../hooks/useNotify";
import { EstadoBase } from "../../../../shared/enums/_generic/estado-base";
import { usePrint } from "../../../../hooks/usePrint";
import { type DTO_RecepcionOCItem } from "../../service/recepcion.requests";
import type { RES_TicketLote } from "../../../../service/responses/lote-producto";
import type { RES_Empleado } from "../../../../service/responses/empleado";
import type {
  RES_OrdenCompra,
  RES_OrdenCompraDetalle,
} from "../../../../service/responses/ordenes-compra/orden-compra";
import { OrdenCompraService } from "../../service/orden-compra.service";

import { useAlmacenesRecepcion } from "./useAlmacenesRecepcion";
import { useHeaderRecepcion } from "./useHeaderRecepcion";
import { useItemsRecepcion } from "./useItemsRecepcion";
import { useComprobanteRecepcion } from "./useComprobanteRecepcion";
import { TipoBien } from "../../../../shared/enums/_generic/tipo-bien";

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

  const [marcas, setMarcas] = useState<RES_Marca[]>([]);
  const [loadingMarcas, setLoadingMarcas] = useState(false);

  const [minas, setMinas] = useState<RES_Mina[]>([]);
  const [loadingMinas, setLoadingMinas] = useState(false);
  const [tipoDestinoActivos, setTipoDestinoActivos] = useState<"almacen" | "mina">("almacen");
  const [selectedMinaDestinoId, setSelectedMinaDestinoId] = useState<number | null>(null);

  const [empleados, setEmpleados] = useState<RES_Empleado[]>([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);

  useEffect(() => {
    const loadMarcas = async () => {
      setLoadingMarcas(true);
      try {
        const res = await AuxService.get_marcas();
        if (res.success) setMarcas(res.data);
      } catch (error) {
        console.error("Error al cargar marcas auxiliares", error);
      } finally {
        setLoadingMarcas(false);
      }
    };
    loadMarcas();
  }, []);

  useEffect(() => {
    const loadMinas = async () => {
      setLoadingMinas(true);
      try {
        const res = await AuxService.get_minas();
        if (res.success) setMinas(res.data);
      } catch (error) {
        console.error("Error al cargar minas auxiliares", error);
      } finally {
        setLoadingMinas(false);
      }
    };
    loadMinas();
  }, []);

  useEffect(() => {
    const loadEmpleados = async () => {
      setLoadingEmpleados(true);
      try {
        const res = await AuxService.get_empleados({ estado: EstadoBase.Activo });
        if (res.success) setEmpleados(res.data);
      } catch (error) {
        console.error("Error al cargar empleados auxiliares", error);
      } finally {
        setLoadingEmpleados(false);
      }
    };
    loadEmpleados();
  }, []);

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

    const isReceivingAssets = selectedGroups.some((g) => g.tipo_bien === TipoBien.ActivoFijo);
    if (isReceivingAssets && tipoDestinoActivos === "mina" && !selectedMinaDestinoId) {
      notifyError("Debe seleccionar una mina de destino para los activos fijos.");
      return;
    }

    // Validaciones detalladas por producto
    selectedGroups.forEach((group) => {
      const gIdx = items.groupedItems.indexOf(group);

      if (group.tipo_bien === TipoBien.ActivoFijo) {
        // Código interno es opcional para activos fijos durante recepciones por OC
        return;
      }
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
        if (group.tipo_bien === TipoBien.ActivoFijo) {
          group.lots.forEach((lot) => {
            finalItems.push({
              id_orden_compra_detalle: group.id_orden_compra_detalle,
              cantidad_base: 1, // En activos fijos cada item es 1
              es_nuevo_lote: false,
              es_activo_fijo: true,
              id_almacen_destino: tipoDestinoActivos === "almacen" ? selectedAlmacenId : null,
              id_mina_destino: tipoDestinoActivos === "mina" ? selectedMinaDestinoId : null,
              id_lote_existente: null,
              descripcion: lot.descripcion,
              fecha_vencimiento: null,
              fecha_ingreso: lot.fecha_ingreso
                ? dayjs(lot.fecha_ingreso).format("YYYY-MM-DD HH:mm:ss")
                : null,
              codigo: lot.codigo || null,
              numero_serie: lot.numero_serie || null,
              modelo: lot.modelo || null,
              id_marca: lot.id_marca || null,
              yearcito_modelo: lot.yearcito_modelo || null,
              descripcion_activo: lot.descripcion_activo || lot.descripcion || null,
              id_empleado_responsable: lot.id_empleado_responsable || null,
            });
          });
          return;
        }

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

    // Minas
    minas,
    loadingMinas,
    tipoDestinoActivos,
    setTipoDestinoActivos,
    selectedMinaDestinoId,
    setSelectedMinaDestinoId,

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

    // Marcas auxiliares
    marcas,
    loadingMarcas,

    // Empleados auxiliares
    empleados,
    loadingEmpleados,
  };
};
