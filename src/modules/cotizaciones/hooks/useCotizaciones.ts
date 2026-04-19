import { useState, useCallback, useEffect } from "react";
import { CotizacionesService } from "../service/cotizaciones.service";
import type {
  RES_Cotizacion,
  RES_CotizacionDetalle,
} from "../service/cotizaciones.responses";
import { Estado_Cotizacion, Estado_Cotizacion_Detalle } from "../../../shared/enums/cotizacion/cotizacion";

export const useCotizaciones = () => {
  const [cotizaciones, setCotizaciones] = useState<RES_Cotizacion[]>([]);
  const [detalles, setDetalles] = useState<RES_CotizacionDetalle[]>([]);
  const [empresas, setEmpresas] = useState<{ id_cotizacion: number; id_empresa: number; razon_social: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const fetchCotizaciones = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await CotizacionesService.get_cotizaciones();
      if (resp.success && resp.data) {
        setCotizaciones(resp.data.cotizaciones || []);
        setDetalles(resp.data.detalles || []);
        setEmpresas(resp.data.empresas || []);
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
    (id: number, nuevoEstado: Estado_Cotizacion, detallesAprobados?: RES_CotizacionDetalle[], id_orden_compra?: number) => {
      setCotizaciones((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado, id_orden_compra: id_orden_compra ?? c.id_orden_compra } : c)),
      );
      
      if (detallesAprobados) {
        setDetalles((prev) => prev.map(d => {
          if (d.id_cotizacion === id) {
            const estaAprobado = detallesAprobados.some(da => da.id === d.id);
            return { ...d, estado: estaAprobado ? Estado_Cotizacion_Detalle.Aprobado : Estado_Cotizacion_Detalle.Rechazado };
          }
          return d;
        }));
      }
    },
    [],
  );

  return {
    cotizaciones,
    detalles,
    empresas,
    loading,
    fetchCotizaciones,
    updateCotizacionLocal,
    busqueda,
    setBusqueda,
  };
};
