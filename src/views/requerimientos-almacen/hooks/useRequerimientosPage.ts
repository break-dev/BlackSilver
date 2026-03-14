import { useState, useEffect, useCallback, useMemo } from "react";
import { RequerimientosService } from "../services/requerimientos.service";
import type {
  RES_RequerimientoAlmacen,
  RES_RequerimientoDetalle,
  RES_TrazabilidadEvento,
} from "../services/requerimientos.responses";
import { EstadoDetalleRequerimiento } from "../../../shared/enums/estados";

export const useRequerimientosPage = () => {
  const [loading, setLoading] = useState(false);
  const [requerimientos, setRequerimientos] = useState<
    RES_RequerimientoAlmacen[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  // Filtros de Periodo
  const [mes, setMes] = useState<string>(String(new Date().getMonth() + 1));
  const [yearcito, setYearcito] = useState<string>(
    String(new Date().getFullYear()),
  );
  const [search, setSearch] = useState("");

  // Detalle y Trazabilidad (UI)
  const [selectedReq, setSelectedReq] =
    useState<RES_RequerimientoAlmacen | null>(null);
  const [detalles, setDetalles] = useState<RES_RequerimientoDetalle[]>([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [selectedDetalle, setSelectedDetalle] =
    useState<RES_RequerimientoDetalle | null>(null);
  const [trazabilidad, setTrazabilidad] = useState<RES_TrazabilidadEvento[]>(
    [],
  );
  const [loadingTrazabilidad, setLoadingTrazabilidad] = useState(false);

  const listar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await RequerimientosService.listar({ mes, yearcito });
      if (res.success) {
        setRequerimientos(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Error al cargar requerimientos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [mes, yearcito]);

  useEffect(() => {
    listar();
  }, [listar]);

  const verDetalles = async (req: RES_RequerimientoAlmacen) => {
    setSelectedReq(req);
    setLoadingDetalle(true);
    try {
      const res = await RequerimientosService.obtenerDetalles(
        req.id_requerimiento,
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

  const verTrazabilidad = async (detalle: RES_RequerimientoDetalle) => {
    setSelectedDetalle(detalle);
    setLoadingTrazabilidad(true);
    try {
      const res = await RequerimientosService.obtenerTrazabilidad(
        detalle.id_requerimiento_almacen_detalle,
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
    if (!q) return requerimientos;
    return requerimientos.filter(
      (item) =>
        (item.correlativo || "").toLowerCase().includes(q) ||
        (item.mina || "").toLowerCase().includes(q),
    );
  }, [requerimientos, search]);

  const progresoGeneral = useMemo(() => {
    if (!detalles || detalles.length === 0) return 0;

    const itemsAtendibles = detalles.filter(
      (item) =>
        item.estado !== EstadoDetalleRequerimiento.Rechazado &&
        item.estado !== EstadoDetalleRequerimiento.EsperandoAprobacion &&
        (item.estado as string) !== "Anulado"
    );

    if (itemsAtendibles.length === 0) return 0;

    const sumaProgreso = itemsAtendibles.reduce((acc, item) => {
      const solicitadoBase = Number(item.cantidad_solicitada_base || 1);
      const atendidoBase = Number(item.cantidad_entregada_base || 0);
      const progresoItem = Math.min(
        100,
        Math.round((atendidoBase / solicitadoBase) * 100)
      );
      return acc + progresoItem;
    }, 0);

    return Math.round(sumaProgreso / itemsAtendibles.length);
  }, [detalles]);

  return {
    requerimientos,
    filteredRecords,
    loading,
    error,
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
      addRecord: (record: RES_RequerimientoAlmacen) => {
        setRequerimientos((prev) => [record, ...prev]);
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
      progresoGeneral,
    },
  };
};
