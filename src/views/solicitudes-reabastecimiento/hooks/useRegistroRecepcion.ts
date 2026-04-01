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
  
  // Nuevos estados para cabecera de recepción
  const [conIncidencia, setConIncidencia] = useState(false);
  const [observacion, setObservacion] = useState("");
  const [evidencias, setEvidencias] = useState<File[]>([]);

  useEffect(() => {
    if (detalles && detalles.length > 0 && groupedItems.length === 0) {
      const grouped: Record<number, GroupedReception> = {};
      detalles.forEach((d) => {
        const key = d.id_solicitud_reabastecimiento_detalle;
        if (!grouped[key]) {
          grouped[key] = {
            ...d,
            total_entregado_base: 0,
            lots: [],
            detalles_origen: [],
          };
        }
        const pendienteReal = Number(d.cantidad_base) - (Number(d.cantidad_recibida_total) || 0);
        grouped[key].total_entregado_base += pendienteReal;
        grouped[key].detalles_origen.push(d);
      });

      const initialGrouped = Object.values(grouped).map((g) => ({
        ...g,
        lots: [
          {
            id_solicitud_reabastecimiento_detalle: g.id_solicitud_reabastecimiento_detalle,
            es_nuevo_lote: true,
            cantidad_base: g.total_entregado_base,
            max_permitido: g.total_entregado_base,
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
        const lastIdx = lots.length - 1;
        
        if (lots.length > 1) {
            // Calculamos cuánto han ocupado los DEMÁS lotes (excepto el actual y el último)
            const otherFixedSum = lots.reduce((acc, l, idx) => {
                if (idx === lotIndex || idx === lastIdx) return acc;
                return acc + (Number(l.cantidad_base) || 0);
            }, 0);
            
            if (lotIndex !== lastIdx) {
                // Si editamos uno que no es el último:
                // Limitamos para que no pase del total (considerando los otros fijos)
                const cappedVal = Math.min(numVal, Math.max(0, group.total_entregado_base - otherFixedSum));
                finalValue = cappedVal as DTO_RecibirLotExtendido[K];
                
                // El último recibe el resto si NO marcamos incidencia tal vez? 
                // No, permitamos que el usuario edite cualquiera y la suma simplemente pueda ser menor.
                // Si el usuario edita el primero de 10 a 5, y el último era 0, el último se queda en 0 o absorbe?
                // Hagamos que el último absorba el remanente SOLO si no estamos editando para ser parcial.
                // MEJOR: Quitamos el "absorber" automático si queremos recepciones parciales fluidas.
                // O mejor aún: solo absorber si la suma supera el total.
            } else {
                finalValue = Math.min(numVal, Math.max(0, group.total_entregado_base - otherFixedSum)) as DTO_RecibirLotExtendido[K];
            }
        } else {
            // Un solo lote: Permitir que sea menor al total para recepción parcial
            finalValue = Math.min(numVal, group.total_entregado_base) as DTO_RecibirLotExtendido[K];
        }
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
      const g = { ...newGrouped[groupIndex] };
      const lots = [...g.lots];
      const lastIdx = lots.length - 1;
      const lastLot = { ...lots[lastIdx] };

      // Reparto inteligente al crear
      const currentQty = Number(lastLot.cantidad_base) || 0;
      // No dividimos a la mitad si es parcial, solo añadimos un lote vacío de 0? 
      // No, mantengamos el split para que sea cómodo.
      const halfQty = Math.floor(currentQty / 2);
      const restQty = currentQty - halfQty;

      lastLot.cantidad_base = restQty;
      if (!lastLot.es_nuevo_lote && lastLot.id_lote_existente) {
          lastLot.ajustes = { [lastLot.id_lote_existente]: restQty };
      }
      lots[lastIdx] = lastLot;

      // Añadimos el nuevo lote con la otra mitad
      lots.push({
        ...lastLot, // Copiamos configuración base
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
      
      // Si solo queda un lote, forzar la cantidad total
      if (lots.length === 1) {
          // No forzamos el total, dejamos que sea parcial si el usuario así lo puso antes
          // lots[0].cantidad_base = newGrouped[groupIndex].total_entregado_base;
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

      const lastIdx = lots.length - 1;

      if (isActive) {
        let finalQty = qty;

        // Suma de todos menos el actual y el último
        const otherFixedSum = lots.reduce((acc, l, idx) => {
            if (idx === lotIndex || idx === lastIdx) return acc;
            return acc + (Number(l.cantidad_base) || 0);
        }, 0);

        if (finalQty === undefined) {
           // Primer click: tomamos lo que falte
           finalQty = Math.max(0, group.total_entregado_base - otherFixedSum - (lotIndex === lastIdx ? 0 : (Number(lot.cantidad_base) || 0)));
           // Si lotIndex !== lastIdx y no hay qty, lo ideal es que tome el remanente total menos lo que ya tengan otros
           // Simplificado para el Radio:
           const currentOthers = lots.reduce((acc, l, idx) => idx === lotIndex ? acc : acc + (Number(l.cantidad_base) || 0), 0);
           finalQty = Math.max(0, group.total_entregado_base - currentOthers);
        } else {
           // Si viene qty del NumberInput de la tabla, lo limitamos
           const maxAvailable = Math.max(0, group.total_entregado_base - otherFixedSum);
           finalQty = Math.min(finalQty, maxAvailable);
        }

        ajustes[idLote] = finalQty;
        lot.cantidad_base = finalQty;
        lot.id_lote_existente = idLote;

        // BALANCEO: El último absorbe el remanente si no estamos editando el último
        if (lots.length > 1 && lotIndex !== lastIdx) {
            const remaining = Math.max(0, group.total_entregado_base - otherFixedSum - finalQty);
            lots[lastIdx] = {
                ...lots[lastIdx],
                cantidad_base: remaining,
                ajustes: (!lots[lastIdx].es_nuevo_lote && lots[lastIdx].id_lote_existente)
                    ? { [lots[lastIdx].id_lote_existente]: remaining }
                    : (lots[lastIdx].ajustes || {})
            };
        }
      } else {
        lot.id_lote_existente = null;
        lot.cantidad_base = 0;

        // BALANCEO AL DESMARCAR: El último recupera lo que quedó libre
        if (lots.length > 1 && lotIndex !== lastIdx) {
            const otherFixedSum = lots.reduce((acc, l, idx) => {
                if (idx === lotIndex || idx === lastIdx) return acc;
                return acc + (Number(l.cantidad_base) || 0);
            }, 0);
            const remaining = Math.max(0, group.total_entregado_base - otherFixedSum);
            lots[lastIdx] = {
                ...lots[lastIdx],
                cantidad_base: remaining,
                ajustes: (!lots[lastIdx].es_nuevo_lote && lots[lastIdx].id_lote_existente)
                    ? { [lots[lastIdx].id_lote_existente]: remaining }
                    : (lots[lastIdx].ajustes || {})
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

      if (sumBase > group.total_entregado_base + 0.0001) {
        newErrors[`groups.${gIdx}.cantidad_total`] = `La suma supera el total entregado (${formatNumber(sumBase)}/${formatNumber(group.total_entregado_base)}).`;
        hasErrors = true;
      }
    });

    // Validación de Incidencia
    if (conIncidencia) {
      if (!observacion.trim()) {
        newErrors["observacion"] = "La observación es obligatoria en caso de incidencia.";
        hasErrors = true;
      }
      if (evidencias.length === 0) {
        newErrors["evidencias"] = "Debe adjuntar al menos una evidencia en caso de incidencia.";
        hasErrors = true;
      }
    }

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
              const cleanLot: Partial<DTO_RecibirLotExtendido> = { ...lot };
              delete cleanLot.ajustes;
              flatLots.push({
                ...cleanLot,
                id_lote_existente: Number(idLote),
                cantidad_base: qty as number,
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
          con_incidencia: conIncidencia,
          observacion: observacion,
          evidencias: evidencias,
          fecha_hora_recepcion: new Date().toISOString(), // O usar un estado si agregamos input de fecha
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
    // Permite recepciones parciales: mayor a 0 y no excede el total
    const sumValid = sumBase > 0 && sumBase <= group.total_entregado_base + 0.0001;
    
    const lotsValid = group.lots.every((lot) => {
      if (Number(lot.cantidad_base) <= 0) return false;
      if (lot.es_nuevo_lote) {
        if (!lot.fecha_ingreso) return false;
        if (group.es_perecible === 1 && !lot.fecha_vencimiento) return false;
      } else {
        if (!lot.id_lote_existente || !lot.ajustes || Object.keys(lot.ajustes).length === 0) return false;
      }
      return true;
    });

    const incidenceValid = !conIncidencia || (observacion.trim().length >= 5 && evidencias.length > 0);

    return sumValid && lotsValid && incidenceValid;
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
    // Estados nuevos
    conIncidencia,
    setConIncidencia,
    observacion,
    setObservacion,
    evidencias,
    setEvidencias,
    isPartialReception: groupedItems.some(g => {
        const sum = g.lots.reduce((acc, l) => acc + (Number(l.cantidad_base) || 0), 0);
        return sum < g.total_entregado_base - 0.0001;
    })
  };
};
