import { useTitlePage } from "../../../hooks/useTitlePage";
import { useCategorias } from "./useCategorias";
import { useRegistroCategoria } from "./useRegistroCategoria";

export const useCategoriasPage = () => {
  useTitlePage("Categorías");

  const {
    loading,
    busqueda,
    setBusqueda,
    filtroClasificacion,
    setFiltroClasificacion,
    filtroDestino,
    setFiltroDestino,
    filtroEstado,
    setFiltroEstado,
    categoriasFiltradas,
    openedCreate,
    openCreate,
    closeCreate,
    onCategoriaGuardada,
    categorias,
  } = useCategorias();

  const registro = useRegistroCategoria({
    categoriasExistentes: categorias,
    onSuccess: onCategoriaGuardada,
    onClose: closeCreate,
  });

  return {
    // useCategorias
    loading,
    busqueda,
    setBusqueda,
    filtroClasificacion,
    setFiltroClasificacion,
    filtroDestino,
    setFiltroDestino,
    filtroEstado,
    setFiltroEstado,
    categoriasFiltradas,
    openedCreate,
    openCreate,
    closeCreate,
    onCategoriaGuardada,
    categorias,

    // useRegistroCategoria
    registro,
  };
};
