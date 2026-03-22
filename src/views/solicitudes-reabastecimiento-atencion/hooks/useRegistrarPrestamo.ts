import { useState, useCallback, useEffect } from "react";
import { SolicitudesAtencionService } from "../service/solicitudes-atencion.service";
import type {
  RES_DetalleSolicitud,
  RES_SolicitudReabastecimiento,
  RES_Prestamo,
  RES_LoteDisponiblePrestamo
} from "../service/solicitudes-atencion.responses";
import { useNotify } from "../../../hooks/useNotify";

interface UseRegistrarPrestamoProps {
  solicitud: RES_SolicitudReabastecimiento;
  detalles: RES_DetalleSolicitud[];
  onSuccess: (nuevoPrestamo: RES_Prestamo) => void;
}

export type AlmacenAliado = {
  id_almacen: number;
  nombre_almacen: string;
  items: {
      id_producto: number;
      nombre_producto: string;
      stock_actual_base: number;
      unidad_medida_base: string;
  }[];
};

export const useRegistrarPrestamo = ({
  solicitud,
  detalles,
  onSuccess,
}: UseRegistrarPrestamoProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [idAlmacenPrestamista, setIdAlmacenPrestamista] = useState<string | null>(null);
  const [fechaLimiteDevolucion, setFechaLimiteDevolucion] = useState<Date | null>(null);
  
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [comentarios, setComentarios] = useState<Record<number, string>>({});

  const [almacenesAliados, setAlmacenesAliados] = useState<AlmacenAliado[]>([]);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);
  const [stocksAlmacen, setStocksAlmacen] = useState<Record<number, RES_LoteDisponiblePrestamo[]>>({});

  const { notifyError, notifySuccess } = useNotify();

  const toggleSelection = (id: number) => {
    setSelectedItemIds((prev) => {
        const isSelecting = !prev.includes(id);
        if (isSelecting) {
            const item = detalles.find(d => d.id_solicitud_detalle === id);
            if (item) {
                // Pre-llenar con la cantidad solicitada de la solicitud original
                setCantidades(c => ({ 
                   ...c, 
                   [id]: Number(item.cantidad_solicitada) 
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
    setComentarios(prev => ({ ...prev, [id]: val }));
  };

  const cargarAlmacenesAliados = useCallback(async (idsProductos: number[]) => {
    if (idsProductos.length === 0) {
      setAlmacenesAliados([]);
      return;
    }
    setLoadingAlmacenes(true);
    try {
      const resp = await SolicitudesAtencionService.getAlmacenesConStock(idsProductos, solicitud.id_almacen_solicitante);
      if (resp.success) {
        const grouped: Record<number, AlmacenAliado> = {};
        resp.data.forEach((item: any) => {
          if (!grouped[item.id_almacen]) {
            grouped[item.id_almacen] = {
              id_almacen: item.id_almacen,
              nombre_almacen: item.nombre_almacen,
              items: []
            };
          }
          grouped[item.id_almacen].items.push({
            id_producto: item.id_producto,
            nombre_producto: item.nombre_producto,
            stock_actual_base: Number(item.stock_actual_base),
            unidad_medida_base: item.unidad_medida_base
          });
        });
        setAlmacenesAliados(Object.values(grouped));
      }
    } catch (error) {
       console.error(error);
    } finally {
      setLoadingAlmacenes(false);
    }
  }, [solicitud.id_almacen_solicitante]);

  useEffect(() => {
    setIdAlmacenPrestamista(null);
    setStocksAlmacen({});
    const ids = detalles
      .filter(d => selectedItemIds.includes(d.id_solicitud_detalle))
      .map(d => d.id_producto);
    cargarAlmacenesAliados(ids);
  }, [selectedItemIds, detalles, cargarAlmacenesAliados]);

  const cargarStockPrestamista = useCallback(async (almacenId: number) => {
    const newStocks: Record<number, RES_LoteDisponiblePrestamo[]> = {};
    const promises = selectedItemIds.map(async (idDetalle) => {
      const item = detalles.find((d) => d.id_solicitud_detalle === idDetalle);
      if (item) {
        const resp = await SolicitudesAtencionService.obtenerLotesDisponiblesPrestamo(item.id_producto, almacenId);
        if (resp.success) {
          newStocks[idDetalle] = resp.data;
        }
      }
    });

    await Promise.all(promises);
    setStocksAlmacen(newStocks);
  }, [selectedItemIds, detalles]);

  const handleRegistrar = async () => {
    if (!idAlmacenPrestamista || selectedItemIds.length === 0) {
      notifyError("Complete todos los campos requeridos");
      return;
    }

    setSubmitting(true);
    try {
      const resp = await SolicitudesAtencionService.crearPrestamo({
        id_solicitud_reabastecimiento: solicitud.id_solicitud,
        id_almacen_prestamista: parseInt(idAlmacenPrestamista),
        fecha_limite_devolucion: fechaLimiteDevolucion ? fechaLimiteDevolucion.toISOString().split('T')[0] : null,
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
    } catch (error) {
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
      stocksAlmacen
    },
    actions: {
      setIdAlmacenPrestamista,
      setFechaLimiteDevolucion,
      toggleSelection,
      setCantidad,
      setComentario,
      handleRegistrar,
      cargarStockPrestamista
    },
  };
};
