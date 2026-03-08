import { useState, useEffect, useMemo, useCallback } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useNotify } from "../../../hooks/useNotify";
import { EmpresasService } from "../service/empresas.service";
import type { RES_Empresa } from "../service/empresas.responses";

export const useEmpresas = () => {
  const { notify } = useNotify();

  // Estados de la lista
  const [empresas, setEmpresas] = useState<RES_Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Modales
  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);

  const listar = useCallback(async () => {
    setLoading(true);
    try {
      const result = await EmpresasService.get_empresas();
      if (result.success) {
        setEmpresas(result.data);
      } else {
        notify({ type: "error", content: result.message });
      }
    } catch (error) {
      notify({ type: "error", content: "Error al cargar las empresas" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    listar();
  }, [listar]);

  const empresasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase();
    return empresas.filter(
      (emp) =>
        !q ||
        emp.razon_social.toLowerCase().includes(q) ||
        emp.nombre_comercial.toLowerCase().includes(q) ||
        emp.ruc.includes(q),
    );
  }, [empresas, busqueda]);

  const onEmpresaCreada = (nueva: RES_Empresa) => {
    setEmpresas((prev) => [nueva, ...prev]);
  };

  return {
    empresas,
    loading,
    busqueda,
    setBusqueda,
    empresasFiltradas,

    // Modales
    openedCreate,
    openCreate,
    closeCreate,

    // Handlers
    onEmpresaCreada,
    recargar: listar,
  };
};
