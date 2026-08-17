import { useCallback, useEffect, useState } from "react";
import { TipoCarbonService } from "../service/tipo-carbon.service";
import { useNotify } from "../../../hooks/useNotify";
import type { RES_VarianteCarbon } from "../service/tipo-carbon.responses";

/**
 * Maneja la carga + set masivo de variantes de un tipo de carbon.
 * El backend expone GET /{id}/variantes (lista actual) y GET .../variantes-opciones
 * (todos los tipos menos el propio, para alimentar el MultiSelect).
 */
export const useVariantesTipo = (idTipoCarbon: number | null) => {
  const [variantesActuales, setVariantesActuales] = useState<
    RES_VarianteCarbon[]
  >([]);
  const [opciones, setOpciones] = useState<
    { value: string; label: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { notifyError, notifySuccess } = useNotify();

  const fetch = useCallback(async () => {
    if (idTipoCarbon === null) return;
    setLoading(true);
    try {
      const [actualRes, opcRes] = await Promise.all([
        TipoCarbonService.getVariantes(idTipoCarbon),
        TipoCarbonService.getVariantesOpciones(idTipoCarbon),
      ]);
      if (actualRes.success && actualRes.data) {
        setVariantesActuales(actualRes.data);
      }
      if (opcRes.success && opcRes.data) {
        setOpciones(
          opcRes.data.map((o) => ({
            value: String(o.id_tipo_carbon),
            label: `${o.nombre}${o.codigo ? ` (${o.codigo})` : ""}`,
          })),
        );
      }
    } catch (e) {
      console.error(e);
      notifyError("No se pudieron cargar las variantes");
    } finally {
      setLoading(false);
    }
  }, [idTipoCarbon, notifyError]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const guardar = async (idsVariante: number[]): Promise<boolean> => {
    if (idTipoCarbon === null) return false;
    setSaving(true);
    try {
      const res = await TipoCarbonService.setVariantes(idTipoCarbon, {
        variantes: idsVariante,
      });
      if (res.success) {
        notifySuccess("Variantes actualizadas");
        if (res.data) setVariantesActuales(res.data);
        return true;
      }
      notifyError(res.message || "No se pudieron guardar las variantes");
      return false;
    } catch (e) {
      console.error(e);
      notifyError("Error al guardar las variantes");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    variantesActuales,
    opciones,
    loading,
    saving,
    fetch,
    guardar,
  };
};