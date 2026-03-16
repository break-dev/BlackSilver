import { useState, useEffect, useCallback, useMemo } from "react";
import { SolicitudesAtencionService } from "../service/solicitudes-atencion.service";
import type {
  RES_SolicitudReabastecimiento,
  RES_Almacen,
} from "../service/solicitudes-atencion.responses";
import dayjs from "dayjs";

export const useAtencionSolicitudes = () => {
  const [loading, setLoading] = useState(false);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);
  const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
  const [solicitudes, setSolicitudes] = useState<
    RES_SolicitudReabastecimiento[]
  >([]);

  const [idAlmacen, setIdAlmacen] = useState<string | null>(null);
  const [mes, setMes] = useState<string>(
    (dayjs().month() + 1).toString().padStart(2, "0"),
  );
  const [yearcito, setYearcito] = useState<string>(dayjs().year().toString());
  const [busqueda, setBusqueda] = useState("");

  const loadAlmacenes = useCallback(async () => {
    setLoadingAlmacenes(true);
    try {
      const resp = await SolicitudesAtencionService.obtenerAlmacenes(false);
      if (resp.success) {
        setAlmacenes(resp.data);
        if (resp.data.length > 0 && !idAlmacen) {
          setIdAlmacen(resp.data[0].id.toString());
        }
      }
    } catch (error) {
      console.error("Error loading almacenes", error);
    } finally {
      setLoadingAlmacenes(false);
    }
  }, [idAlmacen]);

  const loadSolicitudes = useCallback(async () => {
    if (!idAlmacen) return;
    setLoading(true);
    try {
      const resp = await SolicitudesAtencionService.obtenerSolicitudes(
        Number(idAlmacen),
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
        s.solicitante.toLowerCase().includes(lowerBusqueda) ||
        (s.observacion && s.observacion.toLowerCase().includes(lowerBusqueda)),
    );
  }, [solicitudes, busqueda]);

  const updateSolicitudLocal = useCallback(
    (id: number, data: Partial<RES_SolicitudReabastecimiento>) => {
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
