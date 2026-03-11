import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { LotesService } from "../service/lotes.service";
import { Schema_CrearLote } from "../service/lotes.requests";
import type {
  RES_Lote,
  RES_ProductoDisponible,
  RES_UnidadMedida,
  RES_Almacen,
} from "../service/lotes.responses";

interface UseRegistroLoteProps {
  initialAlmacenId?: number | null;
  onSuccess: (lote: RES_Lote) => void;
}

export const useRegistroLote = ({
  initialAlmacenId,
  onSuccess,
}: UseRegistroLoteProps) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Catalogs
  const [productos, setProductos] = useState<RES_ProductoDisponible[]>([]);
  const [unidades, setUnidades] = useState<RES_UnidadMedida[]>([]);
  const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);

  // Form State
  const [idAlmacen, setIdAlmacen] = useState<number>(initialAlmacenId || 0);
  const [idProducto, setIdProducto] = useState<number>(0);
  const [idUnidadMedida, setIdUnidadMedida] = useState<number>(0);
  const [stockInicial, setStockInicial] = useState<number>(0);
  const [contenidoPorPresentacion, setContenidoPorPresentacion] =
    useState<number>(1);
  const [fechaHoraIngreso, setFechaHoraIngreso] = useState<Date | null>(
    new Date(),
  );
  const [fechaVencimiento, setFechaVencimiento] = useState<Date | null>(null);
  const [descripcion, setDescripcion] = useState("");

  // Load catalogs
  useEffect(() => {
    const loadCatalogs = async () => {
      setLoading(true);
      try {
        const [resProds, resUnits, resAlms] = await Promise.all([
          LotesService.listarProductos(),
          LotesService.listarUnidades(),
          LotesService.listarAlmacenes(),
        ]);

        if (resProds.success) {
          setProductos(resProds.data);
        }
        if (resUnits.success) {
          setUnidades(resUnits.data);
        }
        if (resAlms.success) {
          setAlmacenes(resAlms.data);
        }
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    loadCatalogs();
  }, []);

  // Derived state
  const productoSeleccionado = productos.find(
    (p) => p.id_producto === idProducto,
  );

  const unidadSeleccionada = unidades.find(
    (u) => u.id_unidad_medida === idUnidadMedida,
  );

  const stockTotalBase = Number(
    ((stockInicial || 0) * (contenidoPorPresentacion || 1)).toFixed(2),
  );

  const sonUnidadesIdenticas =
    productoSeleccionado &&
    unidadSeleccionada &&
    productoSeleccionado.id_unidad_medida_base ===
      unidadSeleccionada.id_unidad_medida;

  // Auto-set content to 1 if units are identical
  useEffect(() => {
    if (sonUnidadesIdenticas) {
      setContenidoPorPresentacion(1);
    }
  }, [sonUnidadesIdenticas]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setSubmitting(true);
    setError(null);

    const values = {
      id_producto: idProducto,
      id_unidad_medida: idUnidadMedida,
      id_almacen: idAlmacen,
      descripcion,
      stock_inicial: stockInicial,
      contenido_por_presentacion: contenidoPorPresentacion,
      fecha_hora_ingreso: fechaHoraIngreso || new Date(),
      fecha_vencimiento: fechaVencimiento,
    };

    // Validation using Zod
    const validation = Schema_CrearLote.safeParse(values);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setSubmitting(false);
      return;
    }

    try {
      const result = await LotesService.crear(values);
      if (result.success) {
        notifications.show({
          title: "Registro Exitoso",
          message: "El nuevo lote ha sido incorporado al inventario.",
          color: "teal",
        });
        onSuccess(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const unidadBase = unidades.find(
    (u) => u.id_unidad_medida === productoSeleccionado?.id_unidad_medida_base,
  );

  return {
    // Form State & Setters
    idAlmacen,
    setIdAlmacen,
    idProducto,
    setIdProducto,
    idUnidadMedida,
    setIdUnidadMedida,
    stockInicial,
    setStockInicial,
    contenidoPorPresentacion,
    setContenidoPorPresentacion,
    fechaHoraIngreso,
    setFechaHoraIngreso,
    fechaVencimiento,
    setFechaVencimiento,
    descripcion,
    setDescripcion,

    // Status
    loading,
    submitting,
    error,

    // Catalogs
    catalogs: {
      productos,
      unidades,
      almacenes,
    },

    // Derived
    derived: {
      productoSeleccionado,
      unidadSeleccionada,
      unidadBase,
      stockTotalBase,
      sonUnidadesIdenticas,
    },

    handleSubmit,
  };
};
