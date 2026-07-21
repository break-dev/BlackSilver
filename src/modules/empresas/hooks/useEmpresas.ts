import { useState, useEffect, useMemo, useCallback } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useNotify } from "../../../hooks/useNotify";
import { EmpresasService } from "../service/empresas.service";
import type { RES_Empresa } from "../../../service/responses/empresa";
import type { RES_Oficina } from "../../../service/responses/oficina";
import { AuxService } from "../../../service/auxiliar.service";

export const useEmpresas = () => {
  const { notifyError, notifySuccess } = useNotify();

  const [empresas, setEmpresas] = useState<RES_Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);

  const [empresaParaOficina, setEmpresaParaOficina] =
    useState<RES_Empresa | null>(null);
  const [openedOficina, { open: openOficina, close: closeOficina }] =
    useDisclosure(false);

  const listar = useCallback(async () => {
    setLoading(true);
    try {
      const result = await AuxService.get_empresas();
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

  const onEmpresaCreada = (nueva: RES_Empresa) => {
    const nuevaConOficinas: RES_Empresa = { ...nueva, oficinas: [] };
    setEmpresas((prev) => [nuevaConOficinas, ...prev]);
  };

  const onOpenOficinaModal = (empresa: RES_Empresa) => {
    setEmpresaParaOficina(empresa);
    openOficina();
  };

  const closeOficinaModal = () => {
    closeOficina();
    setEmpresaParaOficina(null);
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

    onEmpresaCreada,
    handleUpdateLogo,
    recargar: listar,
  };
};
