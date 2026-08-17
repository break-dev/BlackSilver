import { useCallback, useEffect, useState } from "react";
import { TipoCarbonService } from "../service/tipo-carbon.service";
import { useNotify } from "../../../hooks/useNotify";
import type { RES_TipoCarbon } from "../service/tipo-carbon.responses";

export const useTipoCarbon = () => {
  const [tipos, setTipos] = useState<RES_TipoCarbon[]>([]);
  const [loading, setLoading] = useState(false);
  const { notifyError } = useNotify();

  const fetchTipos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await TipoCarbonService.getTipos();
      if (res.success && res.data) {
        setTipos(res.data);
      }
    } catch (e) {
      console.error(e);
      notifyError("No se pudieron cargar los tipos de carbon");
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  useEffect(() => {
    fetchTipos();
  }, [fetchTipos]);

  const upsertTipo = (t: RES_TipoCarbon) => {
    setTipos((prev) => {
      const idx = prev.findIndex((x) => x.id_tipo_carbon === t.id_tipo_carbon);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = t;
        return next;
      }
      return [...prev, t];
    });
  };

  const removeTipo = (id: number) => {
    setTipos((prev) => prev.filter((x) => x.id_tipo_carbon !== id));
  };

  const refreshCantidadVariantes = (id: number, cantidad: number) => {
    setTipos((prev) =>
      prev.map((x) =>
        x.id_tipo_carbon === id ? { ...x, cantidad_variantes: cantidad } : x,
      ),
    );
  };

  return {
    tipos,
    loading,
    fetchTipos,
    upsertTipo,
    removeTipo,
    refreshCantidadVariantes,
  };
};