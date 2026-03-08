import { useState, useCallback, useEffect } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { ConcesionesService } from "../service/concesiones.service";
import type { RES_Contrato } from "../service/concesiones.responses";

export const useGestionContratos = (id_concesion?: number) => {
  const { notify } = useNotify();
  const [contratos, setContratos] = useState<RES_Contrato[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAccion, setLoadingAccion] = useState(false);

  const listar = useCallback(async () => {
    if (!id_concesion) return;
    setLoading(true);
    try {
      const resp = await ConcesionesService.get_contratos(id_concesion);
      if (resp.success) setContratos(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id_concesion]);

  useEffect(() => {
    listar();
  }, [listar]);

  const handleTerminarContrato = async (id_contrato: number) => {
    setLoadingAccion(true);
    try {
      const resp = await ConcesionesService.terminar_contrato(id_contrato);
      if (resp.success) {
        notify({ type: "success", content: "Contrato finalizado" });
        listar();
      }
    } catch {
      notify({ type: "error", content: "Error inesperado" });
    } finally {
      setLoadingAccion(false);
    }
  };

  return {
    contratos,
    loading,
    loadingAccion,
    handleTerminarContrato,
    recargar: listar,
  };
};
