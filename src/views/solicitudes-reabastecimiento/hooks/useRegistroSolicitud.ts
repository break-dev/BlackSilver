import dayjs from "dayjs";
import { useState, useEffect, useCallback, useMemo } from "react";
import { notifications } from "@mantine/notifications";
import { ReabastecimientoService } from "../service/reabastecimiento.service";
import type {
  DTO_CrearSolicitud,
  DTO_SolicitudDetalle,
} from "../service/reabastecimiento.requests";
import type {
  RES_Almacen_Local,
  RES_Producto_Local,
  RES_Unidad_Local,
  RES_SolicitudReabastecimiento,
} from "../service/reabastecimiento.responses";
import { Premura } from "../../../shared/enums/otros";

interface Props {
  onSuccess: (item: RES_SolicitudReabastecimiento) => void;
}

export const useRegistroSolicitud = ({ onSuccess }: Props) => {
  const [submitting, setSubmitting] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Catálogos
  const [almacenes, setAlmacenes] = useState<RES_Almacen_Local[]>([]);
  const [productos, setProductos] = useState<RES_Producto_Local[]>([]);
  const [unidades, setUnidades] = useState<RES_Unidad_Local[]>([]);

  // Estado Formulario Cabecera
  const [idAlmacenSolicitante, setIdAlmacenSolicitante] = useState<number>(0);
  const [premura, setPremura] = useState<Premura>(Premura.Normal);
  const [fechaEntregaRequerida, setFechaEntregaRequerida] =
    useState<Date | null>(null);
  const [observacion, setObservacion] = useState("");

  // Estado Formulario Detalle (Item actual)
  const [idProducto, setIdProducto] = useState<number>(0);
  const [idUnidadMedida, setIdUnidadMedida] = useState<number>(0);
  const [cantidad, setCantidad] = useState<number>(0);
  const [contenido, setContenido] = useState<number>(1);
  const [comentarioItem, setComentarioItem] = useState("");

  // Lista de detalles agregados
  const [detalles, setDetalles] = useState<DTO_SolicitudDetalle[]>([]);

  // 1. Acción para cargar Catálogos (se llamará On Demand)
  const cargarCatalogos = useCallback(async () => {
    if (almacenes.length > 0) return;
    setLoadingCatalogs(true);
    try {
      const res = await ReabastecimientoService.obtenerCatalogos();
      if (res.success) {
        setAlmacenes(res.data.almacenes);
        setProductos(res.data.productos);
        setUnidades(res.data.unidades_medida);

        if (res.data.almacenes.length > 0) {
          setIdAlmacenSolicitante(res.data.almacenes[0].id_almacen);
        }
      }
    } catch (err) {
      console.error("Error al cargar catálogos", err);
    } finally {
      setLoadingCatalogs(false);
    }
  }, [almacenes.length]);

  // 2. Lógica de Unidades
  const productoSeleccionado = productos.find(
    (p) => p.id_producto === idProducto,
  );
  const unidadSeleccionada = unidades.find(
    (u) => u.id_unidad_medida === idUnidadMedida,
  );
  const sonUnidadesIdenticas =
    productoSeleccionado &&
    unidadSeleccionada &&
    productoSeleccionado.id_unidad_medida_base ===
      unidadSeleccionada.id_unidad_medida;

  useEffect(() => {
    if (sonUnidadesIdenticas) {
      setContenido(1);
    }
  }, [sonUnidadesIdenticas]);

  const productosFiltrados = useMemo(() => {
    return productos.filter(
      (p) => !detalles.some((d) => d.id_producto === p.id_producto),
    );
  }, [productos, detalles]);

  const agregarItem = useCallback(() => {
    if (!idProducto || !idUnidadMedida || cantidad <= 0 || contenido <= 0) {
      notifications.show({
        title: "Error",
        message: "Complete los datos del producto",
        color: "red",
      });
      return;
    }
    const nuevoItem: DTO_SolicitudDetalle = {
      id_producto: idProducto,
      id_unidad_medida: idUnidadMedida,
      cantidad_solicitada: cantidad,
      contenido_por_presentacion: contenido,
      comentario: comentarioItem,
    };
    setDetalles((prev) => [...prev, nuevoItem]);
    setIdProducto(0);
    setIdUnidadMedida(0);
    setCantidad(0);
    setContenido(1);
    setComentarioItem("");
  }, [idProducto, idUnidadMedida, cantidad, contenido, comentarioItem]);

  const eliminarItem = useCallback((index: number) => {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (
      !idAlmacenSolicitante ||
      !fechaEntregaRequerida ||
      detalles.length === 0
    ) {
      setError("Faltan campos obligatorios");
      return;
    }

    setSubmitting(true);
    setError(null);

    const dto: DTO_CrearSolicitud = {
      id_almacen_solicitante: idAlmacenSolicitante,
      premura,
      observacion: observacion || undefined,
      fecha_entrega_requerida: dayjs(fechaEntregaRequerida).format(
        "YYYY-MM-DD",
      ),
      detalles,
    };

    try {
      const res = await ReabastecimientoService.crear(dto);
      if (res.success) {
        notifications.show({
          title: "Éxito",
          message: "Solicitud registrada correctamente",
          color: "teal",
        });
        onSuccess(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Error al registrar solicitud");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }, [
    idAlmacenSolicitante,
    premura,
    observacion,
    fechaEntregaRequerida,
    detalles,
    onSuccess,
  ]);

  return {
    state: {
      almacenes,
      productos,
      productosFiltrados,
      unidades,
      idAlmacenSolicitante,
      setIdAlmacenSolicitante,
      premura,
      setPremura,
      fechaEntregaRequerida,
      setFechaEntregaRequerida,
      observacion,
      setObservacion,
      idProducto,
      setIdProducto,
      idUnidadMedida,
      setIdUnidadMedida,
      cantidad,
      setCantidad,
      contenido,
      setContenido,
      comentarioItem,
      setComentarioItem,
      detalles,
    },
    derived: {
      sonUnidadesIdenticas,
      productoSeleccionado,
      canAdd: idProducto && idUnidadMedida && cantidad > 0,
    },
    status: {
      submitting,
      loadingCatalogs,
      error,
    },
    actions: {
      agregarItem,
      eliminarItem,
      handleSubmit,
      cargarCatalogos,
    },
  };
};
