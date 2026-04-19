import { useState, useEffect, useCallback, useMemo } from "react";
import { OrdenCompraService } from "../service/orden-compra.service";
import type { RES_OrdenCompra } from "../service/orden-compra.responses";
import { useNotify } from "../../../hooks/useNotify";

export const useOrdenCompra = () => {
  const { notify } = useNotify();
  const [ordenes, setOrdenes] = useState<RES_OrdenCompra[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [mes, setMes] = useState<string>(String(new Date().getMonth() + 1));
  const [yearcito, setYearcito] = useState<string>(
    String(new Date().getFullYear()),
  );
  const [search, setSearch] = useState("");

  const fetchOrdenes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await OrdenCompraService.get_ordenes({ 
        mes, 
        year: yearcito 
      });
      if (res.success) {
        setOrdenes(res.data.ordenes ?? []);
      } else {
        notify({ type: "error", content: res.message });
      }
    } catch {
      notify({ type: "error", content: "Error al cargar las Órdenes de Compra." });
    } finally {
      setLoading(false);
    }
  }, [notify, mes, yearcito]);

  useEffect(() => {
    fetchOrdenes();
  }, [fetchOrdenes]);

  const filteredRecords = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ordenes;
    return ordenes.filter(
      (item) =>
        (item.correlativo || "").toLowerCase().includes(q) ||
        (item.empresa_nombre || "").toLowerCase().includes(q) ||
        (item.correlativo_cotizacion || "").toLowerCase().includes(q)
    );
  }, [ordenes, search]);

  return { 
    ordenes, 
    filteredRecords,
    loading, 
    fetchOrdenes,
    filters: {
      mes,
      setMes,
      yearcito,
      setYearcito,
      search,
      setSearch,
    }
  };
};
