import { useState, useEffect } from "react";
import { OrdenCompraService } from "../service/orden-compra.service";
import type { RES_Trazabilidad } from "../../../service/responses/_generic/trazabilidad";

export const useTrazabilidadOC = (idDetalle: number) => {
  const [loading, setLoading] = useState(false);
  const [eventos, setEventos] = useState<RES_Trazabilidad[]>([]);

  useEffect(() => {
    if (!idDetalle) return;
    let mounted = true;

    const fetchTraceability = async () => {
      setLoading(true);
      try {
        const res = await OrdenCompraService.get_seguimiento(idDetalle);
        if (mounted && res.success && res.data) {
          setEventos(res.data);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTraceability();

    return () => {
      mounted = false;
    };
  }, [idDetalle]);

  return { loading, eventos };
};
