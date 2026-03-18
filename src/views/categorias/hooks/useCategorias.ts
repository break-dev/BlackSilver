import { useState, useEffect, useMemo, useCallback } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useNotify } from "../../../hooks/useNotify";
import { CategoriasService } from "../service/categorias.service";
import type { RES_Categoria } from "../service/categorias.responses";

export const useCategorias = () => {
  const { notify } = useNotify();

  // Estados de la lista
  const [categorias, setCategorias] = useState<RES_Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Modales
  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);

  const listar = useCallback(async () => {
    setLoading(true);
    try {
      const result = await CategoriasService.get_categorias();
      if (result.success) {
        setCategorias(result.data);
      } else {
        notify({ type: "error", content: result.message });
      }
    } catch (error) {
      notify({ type: "error", content: "Error al cargar las categorías" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    listar();
  }, [listar]);

  const categoriasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase();
    return categorias.filter(
      (cat) =>
        !q ||
        cat.nombre.toLowerCase().includes(q) ||
        (cat.descripcion || "").toLowerCase().includes(q),
    );
  }, [categorias, busqueda]);

  const onCategoriaGuardada = (nueva: RES_Categoria) => {
    setCategorias((prev) => {
      const index = prev.findIndex((c) => c.id_categoria === nueva.id_categoria);
      if (index !== -1) {
        const actualizadas = [...prev];
        actualizadas[index] = nueva;
        return actualizadas;
      }
      return [nueva, ...prev];
    });
  };

  return {
    categorias,
    loading,
    busqueda,
    setBusqueda,
    categoriasFiltradas,

    // Modales
    openedCreate,
    openCreate,
    closeCreate,

    // Handlers
    onCategoriaGuardada,
    recargar: listar,
  };
};
