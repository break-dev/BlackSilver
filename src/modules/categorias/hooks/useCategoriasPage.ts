import { useMemo, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { useNotify } from "../../../hooks/useNotify";
import { useCategorias } from "./useCategorias";
import { useRegistroCategoria } from "./useRegistroCategoria";
import { CategoriasService } from "../service/categorias.service";
import type { RES_CategoriaResumen } from "../service/categorias.responses";
import { TipoBien } from "../../../shared/enums/_generic/tipo-bien";

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
    useState<RES_CategoriaResumen | null>(null);
  const [idsDestinosTemp, setIdsDestinosTemp] = useState<number[]>([]);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const registro = useRegistroCategoria({
    categoriasExistentes: categorias,
    onSuccess: onCategoriaGuardada,
    onClose: closeCreate,
  });

  const categoriasParaConsumo = useMemo(() => {
    // Si estamos editando y la categoría seleccionada es Suministro
    // O si estamos creando y la clasificación en el registro es Suministro
    const esSuministro = categoriaSeleccionada
      ? categoriaSeleccionada.clasificacion_bien === TipoBien.Suministro
      : registro.clasificacionBien === TipoBien.Suministro;

    return categorias
      .filter((c) => {
        // Si es suministro, solo puede abastecer a Activos Fijos
        if (esSuministro) return c.clasificacion_bien === TipoBien.ActivoFijo;
        return true;
      })
      .map((c) => ({
        value: String(c.id_categoria),
        label: c.nombre,
      }));
  }, [categorias, categoriaSeleccionada, registro.clasificacionBien]);

  const handleOpenGestionDestinos = (cat: RES_CategoriaResumen) => {
    setCategoriaSeleccionada(cat);
    // Parseamos los IDs que vienen de la BD ("1,2,3" -> [1,2,3])
    const ids = cat.categorias_consumidoras
      ? cat.categorias_consumidoras.map((c) => c.id_categoria_consumidora)
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
