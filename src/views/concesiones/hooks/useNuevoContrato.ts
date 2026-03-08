import { useState, useCallback, useEffect } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { ConcesionesService } from "../service/concesiones.service";
import { Schema_CrearContrato } from "../service/concesiones.requests";
import type { RES_Empresa } from "../service/concesiones.responses";

export const useNuevoContrato = (
  id_concesion: number,
  onSuccess: () => void,
) => {
  const { notify } = useNotify();
  const [empresas, setEmpresas] = useState<RES_Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAccion, setLoadingAccion] = useState(false);

  const listarEmpresas = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await ConcesionesService.get_empresas();
      if (resp.success) setEmpresas(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    listarEmpresas();
  }, [listarEmpresas]);

  const handleCrearContrato = async (
    id_empresa: number,
    fecha_inicio: string,
  ) => {
    const data = { id_concesion, id_empresa, fecha_inicio, fecha_fin: null };
    const validation = Schema_CrearContrato.safeParse(data);

    if (!validation.success) {
      notify({ type: "error", content: validation.error.issues[0].message });
      return;
    }

    setLoadingAccion(true);
    try {
      const resp = await ConcesionesService.crear_contrato(validation.data);
      if (resp.success) {
        notify({ type: "success", content: resp.message });
        onSuccess();
      } else {
        notify({ type: "error", content: resp.message });
      }
    } catch (err) {
      console.error(err);
      notify({ type: "error", content: "Error inesperado" });
    } finally {
      setLoadingAccion(false);
    }
  };

  return {
    empresas,
    loading,
    loadingAccion,
    handleCrearContrato,
    recargarEmpresas: listarEmpresas,
  };
};
