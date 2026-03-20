import { useState, useCallback } from "react";
import { SolicitudesAtencionService } from "../service/solicitudes-atencion.service";
import type {
  RES_DetalleSolicitud,
  RES_SolicitudReabastecimiento,
  RES_AlmacenConStock,
  RES_LoteDisponiblePrestamo,
  RES_Prestamo
} from "../service/solicitudes-atencion.responses";
import { notifications } from "@mantine/notifications";

interface UseRegistrarPrestamoProps {
  solicitud: RES_SolicitudReabastecimiento;
  detalles: RES_DetalleSolicitud[];
  onSuccess: (nuevoPrestamo: RES_Prestamo) => void;
}

export const useRegistrarPrestamo = ({
  solicitud,
  detalles,
  onSuccess
}: UseRegistrarPrestamoProps) => {
  const [submitting, setSubmitting] = useState(false);
  
  // Datos del form
  const [idAlmacenPrestamista, setIdAlmacenPrestamista] = useState<string | null>(null);
  const [fechaLimiteDevolucion, setFechaLimiteDevolucion] = useState<Date | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [comentarios, setComentarios] = useState<Record<number, string>>({});

  // Auxiliares (stock de almacenes secundarios)
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);
  const [almacenesDisponibles, setAlmacenesDisponibles] = useState<RES_AlmacenConStock[]>([]);
  const [stocksAlmacen, setStocksAlmacen] = useState<Record<number, RES_LoteDisponiblePrestamo[]>>({});

  // Cargar almacenes que tengan stock de los productos de la solicitud
  const cargarAlmacenesConStock = useCallback(async (idProducto: number) => {
    setLoadingAlmacenes(true);
    try {
      const res = await SolicitudesAtencionService.obtenerAlmacenesConStock(idProducto, solicitud.id_almacen_solicitante);
      if (res.success) {
        setAlmacenesDisponibles(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAlmacenes(false);
    }
  }, [solicitud.id_almacen_solicitante]);

  // Al seleccionar un almacén prestamista, cargar lotes/stock para los items seleccionados
  const cargarStockPrestamista = useCallback(async (almacenId: number) => {
    if (selectedItemIds.length === 0) return;
    
    // Para simplificar, obtenemos los lotes de los productos seleccionados
    const newStocks: Record<number, RES_LoteDisponiblePrestamo[]> = {};
    
    for (const idDetalle of selectedItemIds) {
      const item = detalles.find(d => d.id_solicitud_detalle === idDetalle);
      if (!item) continue;
      
      try {
        const res = await SolicitudesAtencionService.obtenerLotesDisponiblesPrestamo(item.id_producto, almacenId);
        if (res.success) {
          newStocks[idDetalle] = res.data;
        }
      } catch (error) {
        console.error(error);
      }
    }
    setStocksAlmacen(newStocks);
  }, [selectedItemIds, detalles]);

  const toggleSelection = (id: number) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const setCantidad = (id: number, val: number) => {
    setCantidades(prev => ({ ...prev, [id]: val }));
  };

  const handleRegistrar = async () => {
    if (!idAlmacenPrestamista || !fechaLimiteDevolucion || selectedItemIds.length === 0) {
      notifications.show({ title: 'Error', message: 'Complete todos los campos requeridos', color: 'red' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await SolicitudesAtencionService.crearPrestamo({
        id_solicitud_reabastecimiento: solicitud.id_solicitud,
        id_almacen_prestamista: parseInt(idAlmacenPrestamista),
        fecha_limite_devolucion: fechaLimiteDevolucion.toISOString().split('T')[0],
        detalles: selectedItemIds.map(id => ({
          id_solicitud_reabastecimiento_detalle: id,
          cantidad_solicitada: cantidades[id] || 0,
          comentario: comentarios[id] || ""
        }))
      });

      if (res.success) {
        notifications.show({ title: 'Éxito', message: 'Préstamo registrado correctamente', color: 'green' });
        onSuccess(res.data);
      } else {
        notifications.show({ title: 'Error', message: res.message || 'Error al registrar préstamo', color: 'red' });
      }
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Error de red al registrar préstamo', color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  const setComentario = (id: number, val: string) => {
    setComentarios(prev => ({ ...prev, [id]: val }));
  };

  return {
    state: {
      submitting,
      idAlmacenPrestamista,
      fechaLimiteDevolucion,
      selectedItemIds,
      cantidades,
      comentarios,
      almacenesDisponibles,
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
      cargarAlmacenesConStock,
      cargarStockPrestamista
    }
  };
};
