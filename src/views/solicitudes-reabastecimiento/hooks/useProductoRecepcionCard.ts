import { useMemo } from "react";
import type { RES_LoteRecepcion } from "../service/reabastecimiento.responses";

interface UseProductoRecepcionCardProps {
  lotesDisponibles: RES_LoteRecepcion[];
  idProducto: number;
  esNuevoLote: boolean;
  isPerecible: boolean;
  targetVencimiento: string | null;
}

export const useProductoRecepcionCard = ({
  lotesDisponibles,
  idProducto,
  esNuevoLote,
  isPerecible,
  targetVencimiento,
}: UseProductoRecepcionCardProps) => {
  
  const lotes = useMemo(() => {
    if (esNuevoLote) return [];

    // Filtrar los lotes que pertenecen a este producto
    let filtrados = lotesDisponibles.filter(l => l.id_producto === idProducto);

    // Aplicar filtros adicionales de perecibilidad si aplica
    if (isPerecible && targetVencimiento) {
      const targetDateStr = targetVencimiento.split("T")[0].split(" ")[0];
      filtrados = filtrados.filter((l) => {
        if (!l.fecha_vencimiento) return true;
        const lDateStr = l.fecha_vencimiento.split("T")[0].split(" ")[0];
        return lDateStr === targetDateStr;
      });
    } else if (isPerecible) {
      filtrados = filtrados.filter((l) => !l.fecha_vencimiento);
    }

    return filtrados;
  }, [idProducto, esNuevoLote, isPerecible, targetVencimiento, lotesDisponibles]);

  return {
    lotes,
  };
};
