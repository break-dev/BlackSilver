import { useState, useEffect, useCallback, useMemo } from "react";
import { SolicitudesAtencionService } from "../service/solicitudes-atencion.service";
import type { RES_Solicitud } from "../../../service/responses/solicitudes-reabastecimiento/solicitud";
import type { RES_Almacen } from "../../../service/responses/almacen";
import dayjs from "dayjs";

export const useAtencionSolicitudes = () => {
  const [loading, setLoading] = useState(false);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);
  const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
  const [solicitudes, setSolicitudes] = useState<RES_Solicitud[]>([]);

  const [idAlmacen, setIdAlmacen] = useState<string | null>(null);
  const [mes, setMes] = useState<string>(String(new Date().getMonth() + 1));
  const [yearcito, setYearcito] = useState<string>(dayjs().year().toString());
  const [busqueda, setBusqueda] = useState("");

  const loadAlmacenes = useCallback(async () => {
    setLoadingAlmacenes(true);
    try {
      const resp = await SolicitudesAtencionService.obtenerAlmacenes(false);
      if (resp.success) {
        setAlmacenes(resp.data);
        // Solo auto-seleccionar si no hay nada seleccionado aún
        if (resp.data.length > 0) {
          setIdAlmacen(
            (prev) => prev || resp.data[0].id_almacen?.toString() || null,
          );
        }
      }
    } catch (error) {
      console.error("Error loading almacenes", error);
    } finally {
      setLoadingAlmacenes(false);
    }
  }, []);

  const loadSolicitudes = useCallback(async () => {
    const idVal = Number(idAlmacen);
    if (!idAlmacen || isNaN(idVal) || idVal <= 0) return;

    setLoading(true);
    try {
      const resp = await SolicitudesAtencionService.obtenerSolicitudes(
        idVal,
        mes,
        yearcito,
      );
      if (resp.success) {
        setSolicitudes(resp.data);
      }
    } catch (error) {
      console.error("Error loading solicitudes", error);
    } finally {
      setLoading(false);
    }
  }, [idAlmacen, mes, yearcito]);

  useEffect(() => {
    loadAlmacenes();
  }, [loadAlmacenes]);

  useEffect(() => {
    loadSolicitudes();
  }, [loadSolicitudes]);

  const filteredRecords = useMemo(() => {
    if (!busqueda) return solicitudes;
    const lowerBusqueda = busqueda.toLowerCase();
    return solicitudes.filter(
      (s) =>
        s.correlativo.toLowerCase().includes(lowerBusqueda) ||
        s.solicitado_por.toLowerCase().includes(lowerBusqueda) ||
        (s.observacion && s.observacion.toLowerCase().includes(lowerBusqueda)),
    );
  }, [solicitudes, busqueda]);

  const updateSolicitudLocal = useCallback(
    (id: number, data: Partial<RES_Solicitud>) => {
      setSolicitudes((prev) =>
        prev.map((s) => (s.id_solicitud === id ? { ...s, ...data } : s)),
      );
    },
    [],
  );

  return {
    loading,
    loadingAlmacenes,
    almacenes,
    solicitudes: filteredRecords,
    idAlmacen,
    setIdAlmacen,
    mes,
    setMes,
    yearcito,
    setYearcito,
    busqueda,
    setBusqueda,
    refresh: loadSolicitudes,
    updateSolicitudLocal,
  };
};
