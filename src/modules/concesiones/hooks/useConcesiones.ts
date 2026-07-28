import { useState, useEffect, useCallback, useMemo } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useNotify } from "../../../hooks/useNotify";
import { ConcesionesService } from "../service/concesiones.service";
import type { RES_Concesion, RES_Contrato } from "../service/concesiones.responses";
import { EstadoBase } from "../../../shared/enums/_generic/estado-base";

export const useConcesiones = () => {
  const { notify, notifyError, notifySuccess } = useNotify();
  const [concesiones, setConcesiones] = useState<RES_Concesion[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [openedRegistro, { open: openRegistro, close: closeRegistro }] =
    useDisclosure(false);

  // Modal de nuevo contrato
  const [concesionParaContrato, setConcesionParaContrato] =
    useState<RES_Concesion | null>(null);
  const [openedNuevoContrato, { open: openNuevoContrato, close: closeNuevoContrato }] =
    useDisclosure(false);

  // Modal de evidencias
  const [contratoParaEvidencias, setContratoParaEvidencias] =
    useState<RES_Contrato | null>(null);
  const [openedEvidencias, { open: openEvidencias, close: closeEvidencias }] =
    useDisclosure(false);

  // Loading por contrato (para terminar contrato)
  const [loadingIdContrato, setLoadingIdContrato] = useState<number | null>(null);

  const listar = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await ConcesionesService.get_concesiones();
      if (resp.success) {
        setConcesiones(resp.data);
      } else {
        notify({ type: "error", content: resp.message });
      }
    } catch (err) {
      notify({ type: "error", content: "Error al cargar las concesiones" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    listar();
  }, [listar]);

  const filtradas = useMemo(() => {
    const q = busqueda.toLowerCase();
    return concesiones.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.codigo_reinfo?.toLowerCase().includes(q),
    );
  }, [concesiones, busqueda]);

  const pushNuevaConcesion = (nueva: RES_Concesion) => {
    setConcesiones((prev) => [nueva, ...prev]);
  };

  // ──────────────────────────────────────────────────────────
  // CONTRATOS — toda la lógica vive aquí para evitar refetch
  // ──────────────────────────────────────────────────────────

  /**
   * Inserta un contrato recién creado a la concesión correspondiente.
   * Si la concesión aún no tiene contratos en estado local, los inicializa
   * desde la respuesta del backend.
   */
  const pushNuevoContrato = (id_concesion: number, nuevo: RES_Contrato) => {
    setConcesiones((prev) =>
      prev.map((c) => {
        if (c.id_concesion !== id_concesion) return c;
        const contratosActuales = c.contratos ?? [];
        return {
          ...c,
          contratos: [nuevo, ...contratosActuales],
          contratos_activos:
            nuevo.estado === EstadoBase.Activo
              ? c.contratos_activos + 1
              : c.contratos_activos,
        };
      }),
    );

    // Si el modal de evidencias está abierto sobre este contrato, refresca su referencia
    setContratoParaEvidencias((prev) =>
      prev && prev.id_contrato === nuevo.id_contrato ? nuevo : prev,
    );
  };

  const openNuevoContratoModal = (concesion: RES_Concesion) => {
    setConcesionParaContrato(concesion);
    openNuevoContrato();
  };

  const closeNuevoContratoModal = () => {
    closeNuevoContrato();
    setConcesionParaContrato(null);
  };

  const handleTerminarContrato = async (id_contrato: number) => {
    setLoadingIdContrato(id_contrato);
    try {
      const resp = await ConcesionesService.terminar_contrato(id_contrato);
      if (resp.success) {
        notifySuccess("Contrato finalizado");
        setConcesiones((prev) =>
          prev.map((c) => ({
            ...c,
            contratos: (c.contratos ?? []).map((ct) =>
              ct.id_contrato === id_contrato
                ? { ...ct, estado: EstadoBase.Inactivo }
                : ct,
            ),
            contratos_activos: Math.max(0, c.contratos_activos - 1),
          })),
        );
      } else {
        notifyError(resp.message);
      }
    } catch {
      notifyError("Error inesperado al finalizar el contrato");
    } finally {
      setLoadingIdContrato(null);
    }
  };

  const openEvidenciasModal = (id_contrato: number) => {
    const contrato = concesiones
      .flatMap((c) => c.contratos ?? [])
      .find((c) => c.id_contrato === id_contrato);
    if (!contrato) return;
    setContratoParaEvidencias(contrato);
    openEvidencias();
  };

  const closeEvidenciasModal = () => {
    closeEvidencias();
    setContratoParaEvidencias(null);
  };

  const handleSubirEvidencias = async (
    id_contrato: number,
    archivos: File[],
  ): Promise<boolean> => {
    if (archivos.length === 0) return false;
    try {
      const resp = await ConcesionesService.subir_evidencias(id_contrato, archivos);
      if (resp.success && resp.data) {
        notifySuccess("Evidencias agregadas correctamente");
        const nuevasEvidencias = resp.data;
        setConcesiones((prev) =>
          prev.map((c) => ({
            ...c,
            contratos: (c.contratos ?? []).map((ct) =>
              ct.id_contrato === id_contrato
                ? { ...ct, evidencias: nuevasEvidencias }
                : ct,
            ),
          })),
        );
        setContratoParaEvidencias((prev) =>
          prev && prev.id_contrato === id_contrato
            ? { ...prev, evidencias: nuevasEvidencias }
            : prev,
        );
        return true;
      }
      notifyError(resp.message || "Error al subir evidencias");
      return false;
    } catch (err) {
      console.error(err);
      notifyError("Error inesperado al subir evidencias");
      return false;
    }
  };

  const handleEliminarEvidencia = async (
    id_contrato: number,
    path_relativo: string,
  ): Promise<boolean> => {
    try {
      const resp = await ConcesionesService.eliminar_evidencia(
        id_contrato,
        path_relativo,
      );
      if (resp.success && resp.data) {
        notifySuccess("Evidencia eliminada");
        const evidenciasActualizadas = resp.data;
        setConcesiones((prev) =>
          prev.map((c) => ({
            ...c,
            contratos: (c.contratos ?? []).map((ct) =>
              ct.id_contrato === id_contrato
                ? { ...ct, evidencias: evidenciasActualizadas }
                : ct,
            ),
          })),
        );
        setContratoParaEvidencias((prev) =>
          prev && prev.id_contrato === id_contrato
            ? { ...prev, evidencias: evidenciasActualizadas }
            : prev,
        );
        return true;
      }
      notifyError(resp.message || "Error al eliminar la evidencia");
      return false;
    } catch (err) {
      console.error(err);
      notifyError("Error inesperado al eliminar la evidencia");
      return false;
    }
  };

  return {
    concesiones: filtradas,
    loading,
    busqueda,
    setBusqueda,
    recargar: listar,

    pushNuevaConcesion,

    // Modal de registro de concesión
    openedRegistro,
    openRegistro,
    closeRegistro,

    // Modal de nuevo contrato
    concesionParaContrato,
    openedNuevoContrato,
    openNuevoContratoModal,
    closeNuevoContratoModal,
    pushNuevoContrato,

    // Modal de evidencias
    contratoParaEvidencias,
    openedEvidencias,
    openEvidenciasModal,
    closeEvidenciasModal,
    handleSubirEvidencias,
    handleEliminarEvidencia,

    // Acciones sobre contratos
    loadingIdContrato,
    handleTerminarContrato,
  };
};