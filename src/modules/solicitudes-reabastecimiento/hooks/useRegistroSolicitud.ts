import dayjs from "dayjs";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { ReabastecimientoService } from "../service/reabastecimiento.service";
import type {
  DTO_CrearSolicitud,
  DTO_SolicitudDetalle,
} from "../service/reabastecimiento.requests";
import { Premura } from "../../../shared/enums/_generic/premura";
import type { RES_Almacen } from "../../../service/responses/almacen";
import type { RES_UnidadMedida } from "../../../service/responses/unidad-medida";
import type { RES_Solicitud } from "../../../service/responses/solicitudes-reabastecimiento/solicitud";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_Producto } from "../../../service/responses/producto";

interface Props {
  onSuccess: (item: RES_Solicitud) => void;
}

export const useRegistroSolicitud = ({ onSuccess }: Props) => {
  const { notifySuccess, notifyError } = useNotify();
  const [submitting, setSubmitting] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Catálogos
  const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
  const [productos, setProductos] = useState<RES_Producto[]>([]);
  const [unidades, setUnidades] = useState<RES_UnidadMedida[]>([]);

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
      const res_almacenes = await AuxService.get_almacenes();
      const res_productos = await AuxService.get_productos();
      const res_unidades = await AuxService.get_unidades_medida();
      if (
        res_almacenes.success &&
        res_productos.success &&
        res_unidades.success
      ) {
        setAlmacenes(res_almacenes.data);
        setProductos(res_productos.data);
        setUnidades(res_unidades.data);

        if (res_almacenes.data.length > 0) {
          setIdAlmacenSolicitante(res_almacenes.data[0].id_almacen);
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
  useEffect(() => {
    if (idProducto > 0 && productos.length > 0) {
      const prod = productos.find((p) => p.id_producto === idProducto);
      if (prod) {
        setIdUnidadMedida(prod.id_unidad_medida_base);
      }
    }
  }, [idProducto, productos]);

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
      notifyError("Complete los datos del producto");
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
  }, [
    idProducto,
    idUnidadMedida,
    cantidad,
    contenido,
    comentarioItem,
    notifyError,
  ]);

  const eliminarItem = useCallback((index: number) => {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!idAlmacenSolicitante || detalles.length === 0) {
      setError("Faltan campos obligatorios");
      return;
    }

    setSubmitting(true);
    setError(null);

    const esAuditable = detalles.some((d) => {
      const prod = productos.find((p) => p.id_producto === d.id_producto);
      return prod?.es_auditable;
    });

    const dto: DTO_CrearSolicitud = {
      id_almacen_solicitante: idAlmacenSolicitante,
      premura,
      observacion: observacion || undefined,
      es_auditable: esAuditable,
      fecha_entrega_requerida: fechaEntregaRequerida
        ? dayjs(fechaEntregaRequerida).format("YYYY-MM-DD")
        : null,
      detalles,
    };

    try {
      const res = await ReabastecimientoService.crear(dto);
      if (res.success) {
        notifySuccess("Solicitud registrada correctamente");
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
    notifySuccess,
    productos,
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
