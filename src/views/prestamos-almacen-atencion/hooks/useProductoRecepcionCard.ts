import { useState, useEffect, useRef } from "react";
import type { RES_LoteRecepcionReposicion } from "../service/prestamos-atencion.responses";

interface UseProductoRecepcionCardProps {
  idProducto: number;
  esNuevoLote: boolean;
  isPerecible: boolean;
  targetVencimiento: string | null;
  fetchLotesProducto: (id: number) => Promise<RES_LoteRecepcionReposicion[]>;
}

export const useProductoRecepcionCard = ({
  idProducto,
  esNuevoLote,
  isPerecible,
  targetVencimiento,
  fetchLotesProducto,
}: UseProductoRecepcionCardProps) => {
  const [lotes, setLotes] = useState<RES_LoteRecepcionReposicion[]>([]);
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
          filtrados = filtrados.filter(
            (l) => !l.fecha_vencimiento || l.fecha_vencimiento === targetVencimiento
          );
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
