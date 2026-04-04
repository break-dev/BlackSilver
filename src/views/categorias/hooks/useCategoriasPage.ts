import { useMemo, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { useNotify } from "../../../hooks/useNotify";
import { useCategorias } from "./useCategorias";
import { useRegistroCategoria } from "./useRegistroCategoria";
import { CategoriasService } from "../service/categorias.service";
import type { RES_Categoria } from "../service/categorias.responses";

export const useCategoriasPage = () => {
  useTitlePage("Categorías");
  const { notifyError, notifySuccess } = useNotify();

  const {
    loading,
    busqueda,
    setBusqueda,
    categoriasFiltradas,
    openedCreate,
    openCreate,
    closeCreate,
    onCategoriaGuardada,
    categorias,
  } = useCategorias();

  // Estados para la gestión de destinos (al estilo Organigrama)
  const [openedDestinos, { open: openDestinos, close: closeDestinos }] =
    useDisclosure(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<RES_Categoria | null>(null);
  const [idsDestinosTemp, setIdsDestinosTemp] = useState<number[]>([]);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const categoriasParaConsumo = useMemo(
    () =>
      categorias.map((c) => ({
        value: String(c.id_categoria),
        label: c.nombre,
      })),
    [categorias],
  );

  const registro = useRegistroCategoria({
    onSuccess: onCategoriaGuardada,
    onClose: closeCreate,
  });

  const handleOpenGestionDestinos = (cat: RES_Categoria) => {
    setCategoriaSeleccionada(cat);
    // Parseamos los IDs que vienen de la BD ("1,2,3" -> [1,2,3])
    const ids = cat.ids_categorias_consumidoras
      ? cat.ids_categorias_consumidoras.split(",").map(Number)
      : [];
    setIdsDestinosTemp(ids);
    openDestinos();
  };

  const handleGuardarDestinos = async () => {
    // Si categoriaSeleccionada es null, estamos en modo creación
    if (!categoriaSeleccionada) {
      registro.setIdsConsumidoras(idsDestinosTemp);
      closeDestinos();
      return;
    }

    setLoadingUpdate(true);
    try {
      const res = await CategoriasService.actualizar_consumidoras(
        categoriaSeleccionada.id_categoria,
        idsDestinosTemp,
      );
      if (res.success) {
        notifySuccess("Destinos de consumo actualizados");
        onCategoriaGuardada(res.data);
        closeDestinos();
      } else {
        notifyError(res.message);
      }
    } catch (error) {
      notifyError("Error al actualizar destinos");
      console.error(error);
    } finally {
      setLoadingUpdate(false);
    }
  };

  return {
    // useCategorias
    loading,
    busqueda,
    setBusqueda,
    categoriasFiltradas,
    openedCreate,
    openCreate,
    closeCreate,
    onCategoriaGuardada,
    categorias,

    // Destinos Management
    openedDestinos,
    openDestinos,
    closeDestinos,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    idsDestinosTemp,
    setIdsDestinosTemp,
    loadingUpdate,
    categoriasParaConsumo,
    handleOpenGestionDestinos,
    handleGuardarDestinos,

    // useRegistroCategoria
    registro,
  };
};
