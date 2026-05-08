import { useState, useCallback, useEffect } from "react";
import { CotizacionesService } from "../service/cotizaciones.service";
import {
  Estado_Cotizacion,
  Estado_Cotizacion_Detalle,
} from "../../../shared/enums/cotizacion/cotizacion";
import type { RES_Comparativo } from "../../../service/responses/cotizaciones/cotizacion";

export const useCotizaciones = () => {
  const [comparativos, setComparativos] = useState<RES_Comparativo[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchCotizaciones = useCallback(
    async (m?: number, y?: number) => {
      setLoading(true);
      try {
        const resp = await CotizacionesService.get_cotizaciones(
          m ?? mes,
          y ?? year,
        );
        if (resp.success && resp.data) {
          setComparativos(resp.data);
        }
      } catch (e) {
        console.error("Error al cargar cotizaciones:", e);
      } finally {
        setLoading(false);
      }
    },
    [mes, year],
  );

  useEffect(() => {
    fetchCotizaciones();
  }, [fetchCotizaciones]);

  /**
   * Actualiza el estado de una cotización dentro del árbol local
   */
  const updateCotizacionLocal = useCallback(
    (
      id_cotizacion: number,
      nuevoEstado: Estado_Cotizacion,
      idsDetallesAprobados?: number[],
      id_orden_compra?: number,
    ) => {
      setComparativos((prev) =>
        prev.map((comp) => ({
          ...comp,
          cotizaciones: comp.cotizaciones.map((cot) => {
            if (cot.id_cotizacion !== id_cotizacion) return cot;

            const detallesActualizados = idsDetallesAprobados
              ? cot.detalles.map((d) => ({
                  ...d,
                  estado: idsDetallesAprobados.includes(d.id_cotizacion_detalle)
                    ? Estado_Cotizacion_Detalle.Aprobado
                    : Estado_Cotizacion_Detalle.Rechazado,
                }))
              : cot.detalles;

            return {
              ...cot,
              estado: nuevoEstado,
              id_orden_compra: id_orden_compra ?? cot.id_orden_compra,
              detalles: detallesActualizados,
            };
          }),
        })),
      );
    },
    [],
  );

  const cambiarPeriodo = useCallback(
    (nuevoMes: number, nuevoYear: number) => {
      setMes(nuevoMes);
      setYear(nuevoYear);
      fetchCotizaciones(nuevoMes, nuevoYear);
    },
    [fetchCotizaciones],
  );

  const addComparativosLocal = useCallback((nuevos: RES_Comparativo[]) => {
    setComparativos((prev) => {
      const idsActuales = new Set(prev.map((c) => c.id_comparativo));
      const filtrados = nuevos.filter((c) => !idsActuales.has(c.id_comparativo));
      return [...filtrados, ...prev].sort(
        (a, b) => b.id_comparativo - a.id_comparativo,
      );
    });
  }, []);

  const replaceComparativosLocal = useCallback(
    (actualizados: RES_Comparativo[]) => {
      setComparativos((prev) => {
        const mapaActualizados = new Map(
          actualizados.map((c) => [c.id_comparativo, c]),
        );
        return prev.map((c) => mapaActualizados.get(c.id_comparativo) ?? c);
      });
    },
    [],
  );

  return {
    comparativos,
    loading,
    fetchCotizaciones,
    updateCotizacionLocal,
    replaceComparativosLocal,
    busqueda,
    setBusqueda,
    mes,
    year,
    cambiarPeriodo,
    addComparativosLocal,
  };
};
