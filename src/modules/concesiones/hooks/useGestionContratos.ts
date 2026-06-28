import { useState, useCallback, useEffect } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { ConcesionesService } from "../service/concesiones.service";
import type { RES_Contrato } from "../service/concesiones.responses";
import { EstadoBase } from "../../../shared/enums/_generic/estado-base";

export const useGestionContratos = (id_concesion?: number) => {
  const { notify } = useNotify();
  const [contratos, setContratos] = useState<RES_Contrato[]>([]);
  const [loading, setLoading] = useState(false);
  // Ahora rastreamos qué id_contrato específico está en proceso
  const [loadingIdContrato, setLoadingIdContrato] = useState<number | null>(
    null,
  );

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

  /**
   * Añade un nuevo contrato a la lista sin recargar.
   */
  const pushNuevoContrato = (nuevo: RES_Contrato) => {
    setContratos((prev) => [nuevo, ...prev]);
  };

  /**
   * Termina un contrato y notifica el delta (-1) para actualizar el contador
   * en la tabla principal de concesiones.
   */
  const handleTerminarContrato = async (
    id_contrato: number,
    onContratoTerminado?: () => void,
  ) => {
    setLoadingIdContrato(id_contrato);
    try {
      const resp = await ConcesionesService.terminar_contrato(id_contrato);
      if (resp.success) {
        notify({ type: "success", content: "Contrato finalizado" });
        onContratoTerminado?.();

        // También podemos actualizar localmente el estado del contrato sin recargar todo
        setContratos((prev) =>
          prev.map((c) =>
            c.id_contrato === id_contrato
              ? { ...c, estado: EstadoBase.Inactivo }
              : c,
          ),
        );
      }
    } catch {
      notify({ type: "error", content: "Error inesperado" });
    } finally {
      setLoadingIdContrato(null);
    }
  };

  return {
    contratos,
    loading,
    loadingIdContrato,
    handleTerminarContrato,
    pushNuevoContrato,
    recargar: listar,
  };
};
