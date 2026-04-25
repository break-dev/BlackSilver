import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useDisclosure } from "@mantine/hooks";
import { OrdenCompraService } from "../service/orden-compra.service.ts";
import { useNotify } from "../../../hooks/useNotify.ts";
import { usePrint } from "../../../hooks/usePrint.ts";
import { OrdenCompraPDF } from "../../../presentation/utils/orden-compra-pdf.tsx";
import { getOrdenCompraColumns } from "../presentation/orden-compra-page/orden-compra-columns.tsx";

import type {
  RES_OrdenCompra,
  RES_OrdenCompraDetalle,
} from "../../../service/responses/ordenes-compra/orden-compra.ts";

export const useOrdenesCompraPage = () => {
  const { notify } = useNotify();
  const { print } = usePrint();
  const containerRef = useRef<HTMLDivElement>(null);

  const [ordenes, setOrdenes] = useState<RES_OrdenCompra[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [mes, setMes] = useState<string>(String(new Date().getMonth() + 1));
  const [yearcito, setYearcito] = useState<string>(
    String(new Date().getFullYear()),
  );
  const [search, setSearch] = useState("");

  // Estado de Detalle y Impresión
  const [printingId, setPrintingId] = useState<number | null>(null);
  const [selectedOrden, setSelectedOrden] = useState<RES_OrdenCompra | null>(
    null,
  );
  const [detalles, setDetalles] = useState<RES_OrdenCompraDetalle[]>([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [openedDetalle, { open: openDet, close: closeDet }] =
    useDisclosure(false);

  const fetchOrdenes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await OrdenCompraService.get_ordenes({
        mes,
        year: yearcito,
      });
      if (res.success) {
        setOrdenes(res.data ?? []);
      } else {
        notify({ type: "error", content: res.message });
      }
    } catch {
      notify({
        type: "error",
        content: "Error al cargar las Órdenes de Compra.",
      });
    } finally {
      setLoading(false);
    }
  }, [notify, mes, yearcito]);

  useEffect(() => {
    fetchOrdenes();
  }, [fetchOrdenes]);

  const handlePrintOC = useCallback(
    async (orden: RES_OrdenCompra) => {
      setPrintingId(orden.id_orden_compra);
      try {
        const res = await OrdenCompraService.get_detalles(
          orden.id_orden_compra,
        );
        if (res.success) {
          print(<OrdenCompraPDF orden={orden} detalles={res.data} />, {
            documentTitle: `OC - ${orden.correlativo}`,
          });
        } else {
          notify({ type: "error", content: res.message });
        }
      } catch {
        notify({ type: "error", content: "No se pudo generar el PDF." });
      } finally {
        setPrintingId(null);
      }
    },
    [print, notify],
  );

  const handleVerDetalle = useCallback(
    async (orden: RES_OrdenCompra) => {
      setSelectedOrden(orden);
      openDet();
      setLoadingDetalle(true);
      try {
        const res = await OrdenCompraService.get_detalles(
          orden.id_orden_compra,
        );
        if (res.success) {
          setDetalles(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDetalle(false);
      }
    },
    [openDet],
  );

  const filteredRecords = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ordenes;
    return ordenes.filter(
      (item) =>
        (item.correlativo || "").toLowerCase().includes(q) ||
        (item.empresa || "").toLowerCase().includes(q) ||
        (item.correlativo_cotizacion || "").toLowerCase().includes(q),
    );
  }, [ordenes, search]);

  const columns = useMemo(
    () =>
      getOrdenCompraColumns({
        handleVerDetalle,
        handlePrintOC,
        printingId,
      }),
    [printingId, handlePrintOC, handleVerDetalle],
  );

  const groupedOrders = useMemo(() => {
    const groups: Record<
      string,
      { empresa: string; ruc: string; orders: RES_OrdenCompra[] }
    > = {};
    filteredRecords.forEach((order) => {
      if (!groups[order.empresa_ruc]) {
        groups[order.empresa_ruc] = {
          empresa: order.empresa,
          ruc: order.empresa_ruc,
          orders: [],
        };
      }
      groups[order.empresa_ruc].orders.push(order);
    });
    return Object.values(groups);
  }, [filteredRecords]);

  const tableColumns = useMemo(
    () => columns.filter((col) => col.accessor !== "empresa"),
    [columns],
  );

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
    },
    containerRef,
    printingId,
    selectedOrden,
    detalles,
    loadingDetalle,
    openedDetalle,
    closeDet,
    handlePrintOC,
    handleVerDetalle,
    columns,
    groupedOrders,
    tableColumns,
  };
};
