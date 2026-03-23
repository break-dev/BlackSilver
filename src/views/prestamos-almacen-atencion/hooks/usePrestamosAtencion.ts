import { useState, useCallback, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import type { RES_PrestamoAtencion } from "../service/prestamos-atencion.responses";
import { PrestamosAtencionService } from "../service/prestamos-atencion.service";

export const usePrestamosAtencion = () => {
  // -- Almacenes del empleado --
  const [almacenes, setAlmacenes] = useState<{ id_almacen: number; nombre: string }[]>([]);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);

  // -- Filtros de la vista --
  const [idAlmacen, setIdAlmacen] = useState<string | null>(null);
  const [mes, setMes] = useState<string>(dayjs().format("M"));
  const [yearcito, setYearcito] = useState<string>(dayjs().format("YYYY"));
  const [busqueda, setBusqueda] = useState("");

  // -- Datos de la tabla --
  const [prestamos, setPrestamos] = useState<RES_PrestamoAtencion[]>([]);
  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // Cargar almacenes autorizados del empleado
  // --------------------------------------------------
  const obtenerAlmacenesAutorizados = useCallback(async () => {
    setLoadingAlmacenes(true);
    try {
      const res = await PrestamosAtencionService.obtenerAlmacenesAutorizados();
      if (res.success) setAlmacenes(res.data);
    } catch {
      // silencioso
    } finally {
      setLoadingAlmacenes(false);
    }
  }, []);

  // --------------------------------------------------
  // Cargar préstamos por almacén + periodo
  // --------------------------------------------------
  const cargarPrestamos = useCallback(async () => {
    if (!idAlmacen || !mes || !yearcito) return;
    setLoading(true);
    try {
      const res = await PrestamosAtencionService.obtenerPrestamos(idAlmacen, mes, yearcito);
      if (res.success) setPrestamos(res.data ?? []);
    } catch {
      setPrestamos([]);
    } finally {
      setLoading(false);
    }
  }, [idAlmacen, mes, yearcito]);

  useEffect(() => { cargarPrestamos(); }, [cargarPrestamos]);

  // --------------------------------------------------
  // Filtrado local por búsqueda
  // --------------------------------------------------
  const filteredRecords = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return prestamos;
    return prestamos.filter(
      (p) =>
        p.correlativo.toLowerCase().includes(q) ||
        p.almacen_solicitante.toLowerCase().includes(q) ||
        p.registrado_por.toLowerCase().includes(q)
    );
  }, [prestamos, busqueda]);

  // --------------------------------------------------
  // Actualización local (sin re-fetch completo)
  // --------------------------------------------------
  const updatePrestamoLocal = useCallback(
    (id: number, updates: Partial<RES_PrestamoAtencion>) => {
      setPrestamos((prev) =>
        prev.map((p) => (p.id_prestamo === id ? { ...p, ...updates } : p))
      );
    },
    []
  );

  return {
    // estado
    almacenes,
    loadingAlmacenes,
    idAlmacen,
    setIdAlmacen,
    mes,
    setMes,
    yearcito,
    setYearcito,
    busqueda,
    setBusqueda,
    prestamos,
    filteredRecords,
    loading,
    // métodos
    obtenerAlmacenesAutorizados,
    cargarPrestamos,
    updatePrestamoLocal,
  };
};
