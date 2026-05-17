import { useState, useEffect, useCallback, useMemo } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { ControlConsumoService } from "../service/control-consumo.service";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_ControlConsumo } from "../service/control-consumo.responses";
import type { RES_ActivoFijoDisponible } from "../../../service/responses/activo-fijo";

export const useListarControlConsumo = () => {
  const { notifyError } = useNotify();
  const [reporte, setReporte] = useState<RES_ControlConsumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Assets states
  const [activos, setActivos] = useState<RES_ActivoFijoDisponible[]>([]);
  const [idActivoFijo, setIdActivoFijo] = useState<string | null>(null);
  const [loadingActivos, setLoadingActivos] = useState(false);

  // Default values: current month and year
  const currentDate = new Date();
  const [mes, setMes] = useState<number>(currentDate.getMonth() + 1); // 1-indexed (Jan = 1, Dec = 12)
  const [anio, setAnio] = useState<number>(currentDate.getFullYear());

  // Fetch available assets on mount
  useEffect(() => {
    const fetchActivos = async () => {
      setLoadingActivos(true);
      try {
        const resp = await AuxService.get_activos_disponibles();
        if (resp.success) {
          setActivos(resp.data);
          if (resp.data.length > 0) {
            setIdActivoFijo(String(resp.data[0].id_activo));
          } else {
            setIdActivoFijo(null);
          }
        } else {
          notifyError(resp.message || "Error al cargar la lista de activos");
        }
      } catch (err) {
        notifyError("Error al conectar con el servidor para listar activos.");
        console.error(err);
      } finally {
        setLoadingActivos(false);
      }
    };

    fetchActivos();
  }, [notifyError]);

  // Fetch consumption logs when asset, month, or year changes
  const cargarReporte = useCallback(async () => {
    if (!idActivoFijo) {
      setReporte([]);
      return;
    }
    setLoading(true);
    try {
      const resp = await ControlConsumoService.getReporte(
        Number(idActivoFijo),
        mes,
        anio,
      );

      if (resp.success) {
        setReporte(resp.data);
      } else {
        notifyError(resp.message || "Error al cargar los registros de consumo");
      }
    } catch (err) {
      notifyError("Ocurrió un error al cargar el listado de consumo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [idActivoFijo, mes, anio, notifyError]);

  useEffect(() => {
    cargarReporte();
  }, [cargarReporte]);

  // Filter logs in real-time on search query
  const filtrados = useMemo(() => {
    const query = busqueda.toLowerCase().trim();
    if (!query) return reporte;

    return reporte.filter(
      (item) =>
        item.producto.toLowerCase().includes(query) ||
        String(item.correlativo_requerimiento).toLowerCase().includes(query) ||
        item.mina.toLowerCase().includes(query) ||
        item.almacen_destino.toLowerCase().includes(query) ||
        item.contratista_solicitante.toLowerCase().includes(query),
    );
  }, [reporte, busqueda]);

  return {
    reporte: filtrados,
    loading,
    busqueda,
    setBusqueda,
    mes,
    setMes,
    anio,
    setAnio,
    activos,
    idActivoFijo,
    setIdActivoFijo,
    loadingActivos,
    recargar: cargarReporte,
  };
};

export default useListarControlConsumo;
