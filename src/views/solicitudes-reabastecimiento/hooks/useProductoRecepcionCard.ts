import { useState, useEffect, useRef } from "react";
import type { RES_LoteRecepcion } from "../service/reabastecimiento.responses";

interface UseProductoRecepcionCardProps {
  idProducto: number;
  esNuevoLote: boolean;
  isPerecible: boolean;
  targetVencimiento: string | null;
  fetchLotesProducto: (id: number) => Promise<RES_LoteRecepcion[]>;
}

export const useProductoRecepcionCard = ({
  idProducto,
  esNuevoLote,
  isPerecible,
  targetVencimiento,
  fetchLotesProducto,
}: UseProductoRecepcionCardProps) => {
  const [lotes, setLotes] = useState<RES_LoteRecepcion[]>([]);
  const [loadingLotes, setLoadingLotes] = useState(false);
  const fetchedId = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!esNuevoLote && fetchedId.current !== idProducto) {
      Promise.resolve().then(() => setLoadingLotes(true));
      fetchLotesProducto(idProducto).then((data) => {
        if (!mounted) return;
        let filtrados = data;
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
        setLotes(filtrados);
        setLoadingLotes(false);
        fetchedId.current = idProducto;
      });
    }
    return () => {
      mounted = false;
    };
  }, [idProducto, esNuevoLote, isPerecible, targetVencimiento, fetchLotesProducto]);

  return {
    lotes,
    loadingLotes,
  };
};
