import { useState, useEffect, useCallback, useMemo } from "react";
import { ReabastecimientoService } from "../service/reabastecimiento.service";
import type {
  RES_SolicitudReabastecimiento,
  RES_SolicitudDetalle,
  RES_TrazabilidadEvento,
} from "../service/reabastecimiento.responses";

export const useSolicitudesPage = () => {
  const [loading, setLoading] = useState(false);
  const [solicitudes, setSolicitudes] = useState<
    RES_SolicitudReabastecimiento[]
  >([]);

  // Filtros
  const [mes, setMes] = useState<string>(String(new Date().getMonth() + 1));
  const [yearcito, setYearcito] = useState<string>(
    String(new Date().getFullYear()),
  );
  const [search, setSearch] = useState("");

  // Detalles y Trazabilidad (UI)
  const [selectedReq, setSelectedReq] =
    useState<RES_SolicitudReabastecimiento | null>(null);
  const [detalles, setDetalles] = useState<RES_SolicitudDetalle[]>([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [selectedDetalle, setSelectedDetalle] =
    useState<RES_SolicitudDetalle | null>(null);
  const [trazabilidad, setTrazabilidad] = useState<RES_TrazabilidadEvento[]>(
    [],
  );
  const [loadingTrazabilidad, setLoadingTrazabilidad] = useState(false);

  const listar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ReabastecimientoService.listar({
        mes,
        yearcito,
      });
      if (res.success) {
        setSolicitudes(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [mes, yearcito]);

  useEffect(() => {
    listar();
  }, [listar]);

  const verDetalles = async (req: RES_SolicitudReabastecimiento) => {
    setSelectedReq(req);
    setLoadingDetalle(true);
    try {
      const res = await ReabastecimientoService.obtenerDetalles(
        req.id_solicitud,
      );
      if (res.success) {
        setDetalles(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const verTrazabilidad = async (detalle: RES_SolicitudDetalle) => {
    setSelectedDetalle(detalle);
    setLoadingTrazabilidad(true);
    try {
      const res = await ReabastecimientoService.obtenerTrazabilidad(
        detalle.id_solicitud_detalle,
      );
      if (res.success) {
        setTrazabilidad(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTrazabilidad(false);
    }
  };

  const filteredRecords = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return solicitudes;
    return solicitudes.filter(
      (item) =>
        (item.correlativo || "").toLowerCase().includes(q) ||
        (item.correlativo_requerimiento || "").toLowerCase().includes(q) ||
        (item.empleado_solicitante || "").toLowerCase().includes(q),
    );
  }, [solicitudes, search]);

  return {
    solicitudes,
    filteredRecords,
    loading,
    filters: {
      mes,
      setMes,
      yearcito,
      setYearcito,
      search,
      setSearch,
    },
    actions: {
      listar,
      addRecord: (record: RES_SolicitudReabastecimiento) => {
        setSolicitudes((prev) => [record, ...prev]);
      },
      verDetalles,
      verTrazabilidad,
    },
    ui: {
      selectedReq,
      setSelectedReq,
      detalles,
      loadingDetalle,
      selectedDetalle,
      setSelectedDetalle,
      trazabilidad,
      loadingTrazabilidad,
    },
  };
};
