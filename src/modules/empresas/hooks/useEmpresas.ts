import { useState, useEffect, useMemo, useCallback } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useNotify } from "../../../hooks/useNotify";
import { EmpresasService } from "../service/empresas.service";
import type { RES_EmpresaResumen } from "../service/empresas.responses";
import type { RES_Oficina } from "../../../service/responses/oficina";

export const useEmpresas = () => {
  const { notifyError, notifySuccess } = useNotify();

  const [empresas, setEmpresas] = useState<RES_EmpresaResumen[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);

  const [empresaParaOficina, setEmpresaParaOficina] =
    useState<RES_EmpresaResumen | null>(null);
  const [openedOficina, { open: openOficina, close: closeOficina }] =
    useDisclosure(false);

  // Modal de documentos
  const [empresaParaDocumentos, setEmpresaParaDocumentos] =
    useState<RES_EmpresaResumen | null>(null);
  const [openedDocumentos, { open: openDocumentos, close: closeDocumentos }] =
    useDisclosure(false);

  const listar = useCallback(async () => {
    setLoading(true);
    try {
      const result = await EmpresasService.get_empresas();
      if (result.success) {
        setEmpresas(result.data);
      } else {
        notifyError(result.message);
      }
    } catch (error) {
      notifyError("Error al cargar las empresas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  useEffect(() => {
    listar();
  }, [listar]);

  const empresasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase();
    return empresas.filter(
      (emp) =>
        !q || emp.razon_social.toLowerCase().includes(q) || emp.ruc.includes(q),
    );
  }, [empresas, busqueda]);

  const handleUpdateLogo = async (id: number, file: File) => {
    try {
      const result = await EmpresasService.actualizar_logo(id, file);
      if (result.success) {
        setEmpresas((prev) =>
          prev.map((emp) =>
            emp.id_empresa === id ? { ...emp, url_logo: result.data } : emp,
          ),
        );
        notifySuccess("Logo de empresa actualizado correctamente");
        return true;
      } else {
        notifyError(result.message);
        return false;
      }
    } catch (error) {
      notifyError("Error al actualizar el logo");
      console.error(error);
      return false;
    }
  };

  const handleRemoveLogo = async (id: number) => {
    try {
      const result = await EmpresasService.actualizar_logo(id, null as unknown as File);
      if (result.success) {
        setEmpresas((prev) =>
          prev.map((emp) =>
            emp.id_empresa === id ? { ...emp, url_logo: null } : emp,
          ),
        );
        notifySuccess("Logo eliminado");
        return true;
      } else {
        notifyError(result.message);
        return false;
      }
    } catch {
      notifyError("Error al eliminar el logo");
      return false;
    }
  };

  const onEmpresaCreada = (nueva: RES_EmpresaResumen) => {
    const nuevaConOficinas: RES_EmpresaResumen = { ...nueva, oficinas: [] };
    setEmpresas((prev) => [nuevaConOficinas, ...prev]);
  };

  const onOpenOficinaModal = (empresa: RES_EmpresaResumen) => {
    setEmpresaParaOficina(empresa);
    openOficina();
  };

  const closeOficinaModal = () => {
    closeOficina();
    setEmpresaParaOficina(null);
  };

  const onOpenDocumentosModal = (empresa: RES_EmpresaResumen) => {
    setEmpresaParaDocumentos(empresa);
    openDocumentos();
  };

  const closeDocumentosModal = () => {
    closeDocumentos();
    setEmpresaParaDocumentos(null);
  };

  const handleAgregarDocumentos = async (id: number, archivos: File[]) => {
    try {
      const result = await EmpresasService.agregar_documentos(id, archivos);
      if (result.success) {
        setEmpresas((prev) =>
          prev.map((emp) =>
            emp.id_empresa === id ? { ...emp, documentos: result.data } : emp,
          ),
        );
        setEmpresaParaDocumentos((prev) =>
          prev && prev.id_empresa === id ? { ...prev, documentos: result.data } : prev,
        );
        notifySuccess("Documentos agregados correctamente");
        return true;
      } else {
        notifyError(result.message);
        return false;
      }
    } catch {
      notifyError("Error al agregar documentos");
      return false;
    }
  };

  const handleEliminarDocumento = async (id: number, path_relativo: string) => {
    try {
      const result = await EmpresasService.eliminar_documento(id, path_relativo);
      if (result.success) {
        setEmpresas((prev) =>
          prev.map((emp) =>
            emp.id_empresa === id ? { ...emp, documentos: result.data } : emp,
          ),
        );
        setEmpresaParaDocumentos((prev) =>
          prev && prev.id_empresa === id ? { ...prev, documentos: result.data } : prev,
        );
        notifySuccess("Documento eliminado");
        return true;
      } else {
        notifyError(result.message);
        return false;
      }
    } catch {
      notifyError("Error al eliminar documento");
      return false;
    }
  };

  const onOficinaCreada = (nueva: RES_Oficina) => {
    if (!empresaParaOficina) return;

    setEmpresas((prev) =>
      prev.map((emp) => {
        if (emp.id_empresa !== nueva.id_empresa) return emp;

        let oficinasActualizadas = [...(emp.oficinas ?? []), nueva];

        if (nueva.es_principal) {
          oficinasActualizadas = oficinasActualizadas.map((o) => ({
            ...o,
            es_principal: o.id_oficina === nueva.id_oficina,
          }));
        }

        return { ...emp, oficinas: oficinasActualizadas };
      }),
    );
  };

  return {
    empresas,
    loading,
    busqueda,
    setBusqueda,
    empresasFiltradas,

    openedCreate,
    openCreate,
    closeCreate,

    empresaParaOficina,
    openedOficina,
    onOpenOficinaModal,
    closeOficinaModal,
    onOficinaCreada,

    empresaParaDocumentos,
    openedDocumentos,
    onOpenDocumentosModal,
    closeDocumentosModal,
    handleAgregarDocumentos,
    handleEliminarDocumento,

    onEmpresaCreada,
    handleUpdateLogo,
    handleRemoveLogo,
    recargar: listar,
  };
};
