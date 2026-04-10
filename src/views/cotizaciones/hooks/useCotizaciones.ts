import { useState, useCallback, useEffect } from "react";
import { CotizacionesService } from "../service/cotizaciones.service";
import type { RES_Cotizacion } from "../service/cotizaciones.responses";
import { useNotify } from "../../../hooks/useNotify";

export const useCotizaciones = () => {
  const [cotizaciones, setCotizaciones] = useState<RES_Cotizacion[]>([]);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  const fetchCotizaciones = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await CotizacionesService.get_cotizaciones();
      if (resp.success) {
        setCotizaciones(resp.data || []);
      } else {
        notify({ type: "error", content: resp.message });
      }
    } catch {
      notify({ type: "error", content: "Error al cargar el listado de cotizaciones." });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchCotizaciones();
  }, [fetchCotizaciones]);

  return {
    cotizaciones,
    loading,
    refresh: fetchCotizaciones
  };
};
