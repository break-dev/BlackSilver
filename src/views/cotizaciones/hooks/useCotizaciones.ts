import { useState, useCallback, useEffect } from "react";
import { CotizacionesService } from "../service/cotizaciones.service";
import type { RES_Cotizacion } from "../service/cotizaciones.responses";

export const useCotizaciones = () => {
  const [cotizaciones, setCotizaciones] = useState<RES_Cotizacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const fetchCotizaciones = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await CotizacionesService.get_cotizaciones();
      if (resp.success) {
        setCotizaciones(resp.data || []);
      }
    } catch (e) {
      console.error("Error al cargar cotizaciones:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCotizaciones();
  }, [fetchCotizaciones]);

  return {
    cotizaciones,
    loading,
    fetchCotizaciones,
    busqueda,
    setBusqueda
  };
};
