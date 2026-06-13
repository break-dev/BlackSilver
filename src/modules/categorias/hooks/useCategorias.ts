import { useState, useEffect, useMemo, useCallback } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useNotify } from "../../../hooks/useNotify";
import { CategoriasService } from "../service/categorias.service";
import type { RES_CategoriaResumen } from "../service/categorias.responses";
import { useAuditoriaStore } from "../../../stores/auditoria.store";

export const useCategorias = () => {
  const { notify } = useNotify();

  // Estados de la lista
  const [categorias, setCategorias] = useState<RES_CategoriaResumen[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroClasificacion, setFiltroClasificacion] = useState<string | null>(null);
  const [filtroDestino, setFiltroDestino] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null);

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

  const { en_modo_auditable } = useAuditoriaStore();

  const categoriasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase();
    return categorias
      .filter((cat) => !(en_modo_auditable && cat.es_auditable)) // Filtro modo auditoría
      .filter((cat) => {
        // Filtro por búsqueda
        const matchesBusqueda =
          !q ||
          cat.nombre.toLowerCase().includes(q) ||
          (cat.descripcion || "").toLowerCase().includes(q);

        // Filtro por clasificación
        let matchesClasif = true;
        if (filtroClasificacion) {
          if (filtroClasificacion === "Servicio") {
            matchesClasif = cat.tipo_producto === "Servicio";
          } else {
            matchesClasif =
              cat.clasificacion_bien === filtroClasificacion &&
              cat.tipo_producto === "Bien";
          }
        }

        // Filtro por destino de uso
        let matchesDestino = true;
        if (filtroDestino === "Mina") {
          matchesDestino = !!cat.para_mina;
        } else if (filtroDestino === "Cocina") {
          matchesDestino = !!cat.para_cocina;
        }

        // Filtro por estado
        let matchesEstado = true;
        if (filtroEstado) {
          matchesEstado = cat.estado === filtroEstado;
        }

        return matchesBusqueda && matchesClasif && matchesDestino && matchesEstado;
      });
  }, [
    categorias,
    busqueda,
    en_modo_auditable,
    filtroClasificacion,
    filtroDestino,
    filtroEstado,
  ]);

  const onCategoriaGuardada = (nueva: RES_CategoriaResumen) => {
    setCategorias((prev) => {
      const index = prev.findIndex(
        (c) => c.id_categoria === nueva.id_categoria,
      );
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
    filtroClasificacion,
    setFiltroClasificacion,
    filtroDestino,
    setFiltroDestino,
    filtroEstado,
    setFiltroEstado,
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
