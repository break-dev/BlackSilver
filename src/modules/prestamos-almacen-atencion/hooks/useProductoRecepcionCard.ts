import { useMemo } from "react";
import type { RES_LoteDisponible } from "../../../service/responses/lote-producto";

interface UseProductoRecepcionCardProps {
  lotesDisponiblesGlobal: RES_LoteDisponible[];
  idProducto: number;
  esNuevoLote: boolean;
  isPerecible: boolean;
  targetVencimiento: string | null;
}

export const useProductoRecepcionCard = ({
  lotesDisponiblesGlobal,
  idProducto,
  esNuevoLote,
  isPerecible,
  targetVencimiento,
}: UseProductoRecepcionCardProps) => {
  const lotes = useMemo(() => {
    if (esNuevoLote) return [];

    // 1. Filtrar por producto
    let filtrados = lotesDisponiblesGlobal.filter(
      (l) => l.id_producto === idProducto,
    );

    // 2. Aplicar lógica de perecibilidad (si aplica)
    // Si es perecible y tenemos una fecha objetivo (de la entrega de logística), filtramos estrictamente.
    // Pero si no hay fecha objetivo (como en reposiciones donde se quiere ajustar stock libremente),
    // mostramos todos los lotes de ese producto.
    if (isPerecible && targetVencimiento) {
      const targetDateStr = targetVencimiento.split("T")[0].split(" ")[0];
      filtrados = filtrados.filter((l) => {
        if (!l.fecha_vencimiento) return true;
        const lDateStr = l.fecha_vencimiento.split("T")[0].split(" ")[0];
        return lDateStr === targetDateStr;
      });
    }

    return filtrados;
  }, [
    idProducto,
    esNuevoLote,
    isPerecible,
    targetVencimiento,
    lotesDisponiblesGlobal,
  ]);

  return {
    lotes,
  };
};
