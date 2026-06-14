import { useState, useEffect, useCallback } from "react";
import { MantenimientoService } from "../service/mantenimiento.service";
import type { RES_Mantenimiento } from "../service/mantenimiento.responses";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_ActivoFijoDisponible } from "../../../service/responses/activo-fijo";

export const useMantenimiento = () => {
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [yearcito, setYearcito] = useState<number>(new Date().getFullYear());
  const [idActivoFijo, setIdActivoFijo] = useState<number | null>(null);
  const [mantenimientos, setMantenimientos] = useState<RES_Mantenimiento[]>([]);
  const [activos, setActivos] = useState<RES_ActivoFijoDisponible[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingActivos, setLoadingActivos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMantenimientos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await MantenimientoService.getMantenimientos(
        mes,
        yearcito,
        idActivoFijo
      );
      if (resp.success && resp.data) {
        setMantenimientos(resp.data);
      } else {
        setError(resp.message || "Error al cargar mantenimientos");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión al cargar mantenimientos");
    } finally {
      setLoading(false);
    }
  }, [mes, yearcito, idActivoFijo]);

  useEffect(() => {
    fetchMantenimientos();
  }, [fetchMantenimientos]);

  useEffect(() => {
    const fetchActivos = async () => {
      setLoadingActivos(true);
      try {
        const resp = await AuxService.get_activos_disponibles();
        if (resp.success && resp.data) {
          setActivos(resp.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingActivos(false);
      }
    };
    fetchActivos();
  }, []);

  return {
    state: {
      mes,
      setMes,
      yearcito,
      setYearcito,
      idActivoFijo,
      setIdActivoFijo,
      mantenimientos,
      activos,
    },
    status: {
      loading,
      loadingActivos,
      error,
    },
    actions: {
      fetchMantenimientos,
    },
  };
};
