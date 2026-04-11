import { useState, useEffect } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { useAuthStore } from "../../../stores/auth.store";
import { ReabastecimientoService } from "../service/reabastecimiento.service";
import { LotesService } from "../../lotes-productos/service/lotes.service";
import type {
  RES_DetalleEntregaReabastecimiento,
  RES_LoteRecepcion,
} from "../service/reabastecimiento.responses";
import type {
  DTO_RecibirEntregaItem,
  DTO_RegistrarRecepcion,
} from "../service/reabastecimiento.requests";
import type { RES_UnidadMedida } from "../../lotes-productos/service/lotes.responses";
import type { RES_TicketLote } from "../../../presentation/utils/TicketLotePDF";
import { usePrint } from "../../../hooks/usePrint";

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

  const [lotesDisponibles, setLotesDisponibles] = useState<RES_LoteRecepcion[]>(
    [],
  );
  const [loadingLotes, setLoadingLotes] = useState(false);

  useEffect(() => {
    if (detalles && detalles.length > 0 && groupedItems.length === 0) {
      const grouped: Record<number, GroupedReception> = {};
      detalles.forEach((d) => {
        const key = d.id_solicitud_reabastecimiento_detalle;
        if (!grouped[key]) {
          grouped[key] = {
            ...d,
            unidad_base_abv: d.unidad_medida_base_abv,
            total_entregado_base: 0,
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

      const initialGrouped = Object.values(grouped).map((g) => ({
        ...g,
        lots: [
          {
            id_solicitud_reabastecimiento_detalle:
              g.id_solicitud_reabastecimiento_detalle,
            id_entrega_detalle: null,
            es_nuevo_lote: false, // Por defecto ajustar stock
            cantidad_base: g.total_entregado_base,
            max_permitido: g.total_entregado_base,
            id_lote_existente: null,
            fecha_vencimiento: null,
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

  useEffect(() => {
    const ids = Array.from(new Set(detalles.map((d) => d.id_producto)));
    if (ids.length > 0) {
      setLoadingLotes(true);
      ReabastecimientoService.getLotesDestino(idAlmacenSolicitante, ids)
        .then((res) => {
          if (res.success && res.data) {
            setLotesDisponibles(res.data);

            // Si el producto no tiene lotes existentes, cambiamos a "Nuevo Lote" por defecto
            setGroupedItems((prev) =>
              prev.map((group) => {
                const productLots = res.data!.filter(
                  (l) => l.id_producto === group.detalles_origen[0].id_producto,
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
        finalValue = Math.min(
          numVal,
          group.total_entregado_base,
        ) as DTO_RecibirLotExtendido[K];
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
        const finalQty = qty ?? group.total_entregado_base;
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
    if (!idEntrega) return;

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
      });
      if (sumBase > group.total_entregado_base + 0.0001) {
        newErrors[`groups.${gIdx}.cantidad_total`] =
          `La suma supera el total entregado.`;
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
        // Distribuimos los lotes entre los detalles de origen
        let currentDetIdx = 0;
        let detResiduo =
          Number(group.detalles_origen[0].cantidad_base) -
          (Number(group.detalles_origen[0].cantidad_recibida_total_base) || 0);

        group.lots.forEach((lot) => {
          let lotResiduo = Number(lot.cantidad_base);

          while (
            lotResiduo > 0 &&
            currentDetIdx < group.detalles_origen.length
          ) {
            const currentDet = group.detalles_origen[currentDetIdx];
            const partialQty = Math.min(lotResiduo, detResiduo);

            // Mapear el ajuste tabular a id_lote_existente real
            if (!lot.es_nuevo_lote && lot.ajustes) {
              Object.entries(lot.ajustes).forEach(([idLote, qtyAjuste]) => {
                const proportionalQty =
                  (qtyAjuste as number) *
                  (partialQty / Number(lot.cantidad_base));
                items.push({
                  ...lot,
                  id_lote_existente: Number(idLote),
                  cantidad_base: proportionalQty,
                  id_entrega_detalle: currentDet.id_entrega_detalle,
                });
              });
            } else {
              items.push({
                ...lot,
                cantidad_base: partialQty,
                id_entrega_detalle: currentDet.id_entrega_detalle,
              });
            }

            lotResiduo -= partialQty;
            detResiduo -= partialQty;

            if (detResiduo <= 0.0001) {
              currentDetIdx++;
              if (currentDetIdx < group.detalles_origen.length) {
                detResiduo =
                  Number(group.detalles_origen[currentDetIdx].cantidad_base) -
                  (Number(
                    group.detalles_origen[currentDetIdx]
                      .cantidad_recibida_total_base,
                  ) || 0);
              }
            }
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

  const isFormValid = groupedItems.every((group) => {
    const sumBase = group.lots.reduce(
      (acc, l) => acc + (Number(l.cantidad_base) || 0),
      0,
    );
    return sumBase > 0 && sumBase <= group.total_entregado_base + 0.0001;
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
