import { useState, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import { SolicitudesAtencionService } from "../service/solicitudes-atencion.service";
import type { RES_StockTotalAlmacen } from "../service/solicitudes-atencion.responses";
import { useNotify } from "../../../hooks/useNotify";
import type { RES_Almacen } from "../../../service/responses/almacen";
import type {
  RES_Solicitud,
  RES_SolicitudDetalle,
} from "../../../service/responses/solicitudes-reabastecimiento/solicitud";
import type { RES_Prestamo } from "../../../service/responses/prestamos/prestamo";

interface UseRegistrarPrestamoProps {
  solicitud: RES_Solicitud;
  detalles: RES_SolicitudDetalle[];
  onSuccess: (nuevoPrestamo: RES_Prestamo) => void;
}

export type AlmacenAliado = RES_Almacen;

export const useRegistrarPrestamo = ({
  solicitud,
  detalles,
  onSuccess,
}: UseRegistrarPrestamoProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [idAlmacenPrestamista, setIdAlmacenPrestamista] = useState<
    string | null
  >(null);
  const [fechaLimiteDevolucion, setFechaLimiteDevolucion] =
    useState<Date | null>(null);

  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [comentarios, setComentarios] = useState<Record<number, string>>({});

  const [almacenesAliados, setAlmacenesAliados] = useState<AlmacenAliado[]>([]);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [stocksAlmacen, setStocksAlmacen] = useState<
    Record<number, RES_StockTotalAlmacen>
  >({});

  const { notifyError, notifySuccess } = useNotify();

  const toggleSelection = (id: number) => {
    setSelectedItemIds((prev) => {
      const isSelecting = !prev.includes(id);
      if (isSelecting) {
        const item = detalles.find((d) => d.id_solicitud_detalle === id);
        if (item) {
          const cantidadPrestadaSol =
            Number(item.cantidad_prestada_total_base || 0) /
            Number(item.contenido_por_presentacion || 1);
          const pendiente =
            Number(item.cantidad_solicitada) -
            Number(item.cantidad_entregada || 0) -
            cantidadPrestadaSol;

          // Pre-llenar con el pendiente real (o 0 si ya se cubrió todo)
          setCantidades((c) => ({
            ...c,
            [id]: Math.max(0, pendiente),
          }));
        }
      }
      return isSelecting ? [...prev, id] : prev.filter((i) => i !== id);
    });
  };

  const setCantidad = (id: number, val: number) => {
    setCantidades((prev) => ({ ...prev, [id]: val }));
  };

  const setComentario = (id: number, val: string) => {
    setComentarios((prev) => ({ ...prev, [id]: val }));
  };

  const cargarAlmacenesAliados = useCallback(
    async (idsProductos: number[]) => {
      if (idsProductos.length === 0) {
        setAlmacenesAliados([]);
        return;
      }
      setLoadingAlmacenes(true);
      try {
        const resp = await SolicitudesAtencionService.getAlmacenesConStock(
          idsProductos,
          solicitud.id_almacen_solicitante,
        );
        if (resp.success) {
          setAlmacenesAliados(resp.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingAlmacenes(false);
      }
    },
    [solicitud.id_almacen_solicitante],
  );

  useEffect(() => {
    setIdAlmacenPrestamista(null);
    setStocksAlmacen({});
    const ids = detalles
      .filter((d) => selectedItemIds.includes(d.id_solicitud_detalle))
      .map((d) => d.id_producto);
    cargarAlmacenesAliados(ids);
  }, [selectedItemIds, detalles, cargarAlmacenesAliados]);

  const cargarStockPrestamista = useCallback(
    async (almacenId: number) => {
      if (selectedItemIds.length === 0) return;

      setLoadingStocks(true);
      try {
        const idsProductosRaw = detalles
          .filter((d) => selectedItemIds.includes(d.id_solicitud_detalle))
          .map((d) => d.id_producto);

        const idsProductosUnicos = [...new Set(idsProductosRaw)];

        if (idsProductosUnicos.length === 0) return;

        const resp =
          await SolicitudesAtencionService.obtenerStockTotalAlmacenPorProductos(
            almacenId,
            idsProductosUnicos,
          );

        if (resp.success && resp.data) {
          const stockMap: Record<number, RES_StockTotalAlmacen> = {};

          selectedItemIds.forEach((idDetalle) => {
            const detail = detalles.find(
              (d) => d.id_solicitud_detalle === idDetalle,
            );
            if (detail) {
              const stockInfo = resp.data.find(
                (s) => Number(s.id_producto) === Number(detail.id_producto),
              );
              if (stockInfo) {
                stockMap[idDetalle] = stockInfo;
              }
            }
          });

          setStocksAlmacen(stockMap);
        }
      } catch (error) {
        console.error("Error al cargar stock del prestamista:", error);
      } finally {
        setLoadingStocks(false);
      }
    },
    [selectedItemIds, detalles],
  );

  const handleRegistrar = async () => {
    if (!idAlmacenPrestamista || selectedItemIds.length === 0) {
      notifyError("Complete todos los campos requeridos");
      return;
    }

    setSubmitting(true);
    const selectedDetails = detalles.filter((d) =>
      selectedItemIds.includes(d.id_solicitud_detalle),
    );
    const esAuditable = selectedDetails.some((d) => d.es_auditable);

    try {
      const resp = await SolicitudesAtencionService.crearPrestamo({
        id_solicitud_reabastecimiento: solicitud.id_solicitud,
        id_almacen_prestamista: parseInt(idAlmacenPrestamista),
        es_auditable: esAuditable,
        fecha_limite_devolucion: fechaLimiteDevolucion
          ? dayjs(fechaLimiteDevolucion).format("YYYY-MM-DD")
          : null,
        detalles: selectedItemIds.map((id) => ({
          id_solicitud_reabastecimiento_detalle: id,
          cantidad_solicitada: cantidades[id] || 0,
          comentario: comentarios[id] || "",
        })),
      });

      if (resp.success) {
        notifySuccess("Préstamo registrado correctamente");
        onSuccess(resp.data);
      } else {
        notifyError(resp.message || "Error al registrar");
      }
    } catch {
      notifyError("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    state: {
      submitting,
      idAlmacenPrestamista,
      fechaLimiteDevolucion,
      selectedItemIds,
      cantidades,
      comentarios,
      almacenesAliados,
      loadingAlmacenes,
      loadingStocks,
      stocksAlmacen,
    },
    actions: {
      setIdAlmacenPrestamista,
      setFechaLimiteDevolucion,
      toggleSelection,
      setCantidad,
      setComentario,
      handleRegistrar,
      cargarStockPrestamista,
    },
  };
};
