import { useState, useEffect, useCallback } from "react";
import { OrdenCompraService } from "../service/orden-compra.service";
import type { RES_OrdenCompra } from "../service/orden-compra.responses";
import { useNotify } from "../../../hooks/useNotify";

export const useOrdenCompra = () => {
  const { notify } = useNotify();
  const [ordenes, setOrdenes] = useState<RES_OrdenCompra[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrdenes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await OrdenCompraService.get_ordenes();
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
  }, [notify]);

  useEffect(() => {
    fetchOrdenes();
  }, [fetchOrdenes]);

  return { ordenes, loading, fetchOrdenes };
};
