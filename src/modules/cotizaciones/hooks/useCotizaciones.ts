import { useState, useCallback, useEffect } from "react";
import { CotizacionesService } from "../service/cotizaciones.service";
import type {
  RES_Cotizacion,
  RES_CotizacionDetalle,
} from "../service/cotizaciones.responses";
import { Estado_Cotizacion } from "../../../shared/enums/cotizacion/cotizacion";

export const useCotizaciones = () => {
  const [cotizaciones, setCotizaciones] = useState<RES_Cotizacion[]>([]);
  const [detalles, setDetalles] = useState<RES_CotizacionDetalle[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const fetchCotizaciones = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await CotizacionesService.get_cotizaciones();
      if (resp.success && resp.data) {
        setCotizaciones(resp.data.cotizaciones || []);
        setDetalles(resp.data.detalles || []);
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

  const updateCotizacionLocal = useCallback(
    (id: number, nuevoEstado: Estado_Cotizacion) => {
      setCotizaciones((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c)),
      );
    },
    [],
  );

  return {
    cotizaciones,
    detalles,
    loading,
    fetchCotizaciones,
    updateCotizacionLocal,
    busqueda,
    setBusqueda,
  };
};
