import { useState, useEffect, useCallback } from "react";
import { ProduccionService } from "../service/produccion.service";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_LoteMineralEnProduccion } from "../service/produccion.responses";
import type { RES_LoteMineral } from "../../../service/responses/lote-mineral";
import { EstadoLoteMineral } from "../../../shared/enums/lote-mineral";
import { useNotify } from "../../../hooks/useNotify";

export const useProduccion = () => {
  const { notifySuccess, notifyError } = useNotify();

  const [lotes, setLotes] = useState<RES_LoteMineralEnProduccion[]>([]);
  const [lotesPendientes, setLotesPendientes] = useState<RES_LoteMineral[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingPendientes, setLoadingPendientes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResumen = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await ProduccionService.getResumen();
      if (resp.success && resp.data) {
        setLotes(resp.data);
      } else {
        setError(resp.message || "Error al cargar resumen de producción");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión al cargar resumen de producción");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLotesPendientes = useCallback(async () => {
    setLoadingPendientes(true);
    try {
      const resp = await AuxService.get_lotes_mineral({
        estado: EstadoLoteMineral.Pendiente,
      });
      if (resp.success && resp.data) {
        setLotesPendientes(resp.data);
      }
    } catch (err) {
      console.error("Error al cargar lotes pendientes:", err);
    } finally {
      setLoadingPendientes(false);
    }
  }, []);

  const iniciarProduccion = async (id_lote_mineral: number) => {
    setSubmitting(true);
    try {
      const resp = await ProduccionService.iniciarProduccion(id_lote_mineral);
      if (resp.success) {
        notifySuccess("Proceso de producción iniciado correctamente.");
        // Traer consumos del lote nuevo
        const loteResp = await ProduccionService.getResumen();
        if (loteResp.success && loteResp.data) {
          const nuevoLote = loteResp.data.find(
            (l) => l.id_lote_mineral === id_lote_mineral
          );
          if (nuevoLote) {
            // Agregar al inicio sin recargar todo
            setLotes((prev) => [nuevoLote, ...prev]);
          }
        }
        fetchLotesPendientes();
        return true;
      } else {
        notifyError(resp.message || "Error al iniciar producción");
        return false;
      }
    } catch (err) {
      console.error(err);
      notifyError("Error de conexión");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const finalizarProduccion = async (id_lote_mineral: number) => {
    setSubmitting(true);
    try {
      const resp = await ProduccionService.finalizarProduccion(id_lote_mineral);
      if (resp.success) {
        notifySuccess("Proceso de producción finalizado correctamente.");
        // Actualizar estado del lote en la lista sin recargar
        setLotes((prev) =>
          prev.map((lote) =>
            lote.id_lote_mineral === id_lote_mineral
              ? { ...lote, estado: EstadoLoteMineral.Finalizado }
              : lote
          )
        );
        return true;
      } else {
        notifyError(resp.message || "Error al finalizar producción");
        return false;
      }
    } catch (err) {
      console.error(err);
      notifyError("Error de conexión");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchResumen();
    fetchLotesPendientes();
  }, [fetchResumen, fetchLotesPendientes]);

  return {
    state: {
      lotes,
      lotesPendientes,
    },
    status: {
      loading,
      loadingPendientes,
      submitting,
      error,
    },
    actions: {
      fetchResumen,
      fetchLotesPendientes,
      iniciarProduccion,
      finalizarProduccion,
    },
  };
};
