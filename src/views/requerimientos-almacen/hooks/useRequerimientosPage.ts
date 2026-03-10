import { useState, useEffect, useCallback } from "react";
import { RequerimientosService } from "../services/requerimientos.service";
import type {
  RES_RequerimientoAlmacen,
  RES_RequerimientoDetalle,
  RES_TrazabilidadEvento,
  RES_LaborRelacionada,
} from "../services/requerimientos.responses";

export const useRequerimientosPage = () => {
  const [loading, setLoading] = useState(false);
  const [requerimientos, setRequerimientos] = useState<
    RES_RequerimientoAlmacen[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [mes, setMes] = useState<string>(new Date().getMonth() + 1 + "");
  const [yearcito, setYearcito] = useState<string>(
    new Date().getFullYear() + "",
  );

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

  const [laboresVinculadas, setLaboresVinculadas] = useState<
    RES_LaborRelacionada[]
  >([]);
  const [loadingLabores, setLoadingLabores] = useState(false);

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

  const verLabores = async (req: RES_RequerimientoAlmacen) => {
    setSelectedReq(req);
    setLoadingLabores(true);
    try {
      const res = await RequerimientosService.obtenerLaboresVinculadas(
        req.id_requerimiento,
      );
      if (res.success) {
        setLaboresVinculadas(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLabores(false);
    }
  };

  return {
    requerimientos,
    loading,
    error,
    filters: {
      mes,
      setMes,
      yearcito,
      setYearcito,
    },
    actions: {
      listar,
      verDetalles,
      verTrazabilidad,
      verLabores,
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
      laboresVinculadas,
      loadingLabores,
    },
  };
};
