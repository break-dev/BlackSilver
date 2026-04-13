import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { LotesService } from "../service/lotes.service";
import type { RES_Lote, RES_Almacen } from "../service/lotes.responses";
import { useUIStore } from "../../../stores/ui.store";
import type { RES_TicketLote } from "../../../service/responses/lote-producto";

export const useLotesPage = () => {
  const setTitle = useUIStore((state) => state.setTitle);

  const [searchParams] = useSearchParams();
  const initialAlmacenId = searchParams.get("idAlmacen");

  // States
  const [lotes, setLotes] = useState<RES_Lote[]>([]);
  const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [idAlmacen, setIdAlmacen] = useState<string | null>(initialAlmacenId);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
  const [filtroProducto, setFiltroProducto] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    setTitle("Lotes");
    const loadAlmacenes = async () => {
      setLoadingAlmacenes(true);
      try {
        const result = await LotesService.listarAlmacenes();
        if (result.success) {
          setAlmacenes(result.data);
          // Select first warehouse if none is selected in URL
          if (!initialAlmacenId && result.data.length > 0) {
            setIdAlmacen(String(result.data[0].id_almacen));
          }
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(String(err));
      } finally {
        setLoadingAlmacenes(false);
      }
    };
    loadAlmacenes();
  }, [setTitle, initialAlmacenId]);

  // Load lotes when warehouse changes
  useEffect(() => {
    const loadLotes = async () => {
      if (!idAlmacen) {
        setLotes([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await LotesService.listarResumenLotes(Number(idAlmacen));
        if (result.success) {
          setLotes(result.data);
          setBusqueda("");
          setFiltroCategoria(null);
          setFiltroProducto(null);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    loadLotes();
  }, [idAlmacen]);

  // Derived Data
  const categoriasUnicas = useMemo(() => {
    const unique = new Set(lotes.map((l) => l.categoria).filter(Boolean));
    return Array.from(unique)
      .sort()
      .map((c) => ({ value: String(c), label: String(c) }));
  }, [lotes]);

  const productosUnicos = useMemo(() => {
    const source = filtroCategoria
      ? lotes.filter((l) => l.categoria === filtroCategoria)
      : lotes;
    const unique = new Set(source.map((l) => l.producto).filter(Boolean));
    return Array.from(unique)
      .sort()
      .map((p) => ({ value: String(p), label: String(p) }));
  }, [lotes, filtroCategoria]);

  const filteredRecords = useMemo(() => {
    return lotes.filter((l) => {
      const matchCategoria =
        !filtroCategoria || l.categoria === filtroCategoria;
      const matchProducto = !filtroProducto || l.producto === filtroProducto;

      const q = busqueda.toLowerCase();
      const matchBusqueda =
        !busqueda ||
        l.producto.toLowerCase().includes(q) ||
        l.correlativo.toLowerCase().includes(q) ||
        (l.categoria || "").toLowerCase().includes(q);

      return matchCategoria && matchProducto && matchBusqueda;
    });
  }, [lotes, busqueda, filtroCategoria, filtroProducto]);

  return {
    // Data
    almacenes,
    records: filteredRecords,
    loading,
    loadingAlmacenes,
    error,

    // Filters
    idAlmacen,
    setIdAlmacen,
    busqueda,
    setBusqueda,
    filtroCategoria,
    setFiltroCategoria,
    filtroProducto,
    setFiltroProducto,
    categoriasUnicas,
    productosUnicos,

    // Methods
    refresh: async () => {
      if (!idAlmacen) return;
      setLoading(true);
      try {
        const result = await LotesService.listarResumenLotes(Number(idAlmacen));
        if (result.success) setLotes(result.data);
      } finally {
        setLoading(false);
      }
    },
    addLote: (lote: RES_Lote) => {
      if (idAlmacen && String(lote.id_almacen) === String(idAlmacen)) {
        setLotes((prev) => [lote, ...prev]);
      }
    },
    updateLote: (lote: RES_Lote) => {
      setLotes((prev) =>
        prev.map((l) => (l.id_lote === lote.id_lote ? lote : l)),
      );
    },
    armarTicket: (lote: RES_Lote): RES_TicketLote => ({
      id: lote.id_lote,
      producto: lote.producto,
      lote: lote.correlativo,
      almacen:
        almacenes.find((a) => String(a.id_almacen) === String(lote.id_almacen))
          ?.nombre || "Sin Almacén",
      fecha_ingreso: lote.fecha_hora_ingreso,
    }),
  };
};
