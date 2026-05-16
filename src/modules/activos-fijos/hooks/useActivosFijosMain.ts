import { useState, useEffect, useMemo } from "react";
import { ActivosService } from "../service/activos.service";
import type { RES_ActivoFijoResumen } from "../service/activos.responses";
import { useNotify } from "../../../hooks/useNotify";

export const useActivosMain = () => {
  const { notifyError } = useNotify();

  const [activos, setActivos] = useState<RES_ActivoFijoResumen[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [idAlmacen, setIdAlmacen] = useState<string | null>(null);
  const [idMina, setIdMina] = useState<string | null>(null);

  const fetchActivos = async () => {
    setLoading(true);
    try {
      const res = await ActivosService.getActivos();
      if (res.success) setActivos(res.data);
    } catch (error) {
      console.error("Error al cargar activos", error);
      notifyError("Error al cargar activos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivos();
  }, []);

  const activosFiltrados = useMemo(() => {
    return activos.filter((a) => {
      const matchAlmacen = !idAlmacen || String(a.id_almacen) === idAlmacen;
      const matchMina = !idMina || String(a.id_mina) === idMina;
      const matchBusqueda =
        !busqueda ||
        a.producto.toLowerCase().includes(busqueda.toLowerCase()) ||
        a.correlativo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (a.codigo || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        (a.numero_serie || "").toLowerCase().includes(busqueda.toLowerCase());

      return matchAlmacen && matchMina && matchBusqueda;
    });
  }, [activos, idAlmacen, idMina, busqueda]);

  // Generar opciones de filtro a partir de los datos cargados
  const almacenesFiltro = useMemo(() => {
    const map = new Map<number, string>();
    activos.forEach((a) => {
      if (a.id_almacen && a.almacen) map.set(a.id_almacen, a.almacen);
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({
      id_almacen: id,
      nombre,
    }));
  }, [activos]);

  const minasFiltro = useMemo(() => {
    const map = new Map<number, string>();
    activos.forEach((a) => {
      if (a.id_mina && a.mina) map.set(a.id_mina, a.mina);
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({
      id_mina: id,
      nombre,
    }));
  }, [activos]);

  const addActivo = (nuevo: RES_ActivoFijoResumen) => {
    setActivos((prev) => [nuevo, ...prev]);
  };

  return {
    activos: activosFiltrados,
    almacenesFiltro,
    minasFiltro,
    loading,
    busqueda,
    setBusqueda,
    idAlmacen,
    setIdAlmacen,
    idMina,
    setIdMina,
    refresh: fetchActivos,
    addActivo,
  };
};
