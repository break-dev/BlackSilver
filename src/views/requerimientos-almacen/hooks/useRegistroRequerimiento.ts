import dayjs from "dayjs";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { RequerimientosService } from "../services/requerimientos.service";
import { Schema_CrearRequerimiento } from "../services/requerimientos.requests";
import type {
  DTO_CrearRequerimiento,
  DTO_CrearRequerimientoDetalle,
} from "../services/requerimientos.requests";
import type {
  RES_Mina_Local,
  RES_Almacen_Local,
  RES_Labor_Local,
  RES_Producto_Local,
  RES_Unidad_Local,
  RES_RequerimientoAlmacen,
} from "../services/requerimientos.responses";
import { Premura } from "../../../shared/enums/otros";

interface Props {
  onSuccess: (item: RES_RequerimientoAlmacen) => void;
}

export const useRegistroRequerimiento = ({ onSuccess }: Props) => {
  const { notifySuccess, notifyError } = useNotify();
  const [submitting, setSubmitting] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Catálogos
  const [minas, setMinas] = useState<RES_Mina_Local[]>([]);
  const [almacenes, setAlmacenes] = useState<RES_Almacen_Local[]>([]);
  const [labores, setLabores] = useState<RES_Labor_Local[]>([]);
  const [productos, setProductos] = useState<RES_Producto_Local[]>([]);
  const [unidades, setUnidades] = useState<RES_Unidad_Local[]>([]);

  // Estado Formulario Cabecera
  const [idMina, setIdMina] = useState<number>(0);
  const [idAlmacenDestino, setIdAlmacenDestino] = useState<number>(0);
  const [idLabores, setIdLabores] = useState<number[]>([]);
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
  const [idProductoDestino, setIdProductoDestino] = useState<number>(0);

  // Lista de detalles agregados
  const [detalles, setDetalles] = useState<DTO_CrearRequerimientoDetalle[]>([]);

  // 1. Cargar Catálogos Iniciales (Consolidado)
  useEffect(() => {
    const loadInitial = async () => {
      setLoadingCatalogs(true);
      try {
        const res = await RequerimientosService.obtenerDataRegistro();
        if (res.success) {
          setMinas(res.data.minas);
          setProductos(res.data.productos);
          setUnidades(res.data.unidades);
        }
      } finally {
        setLoadingCatalogs(false);
      }
    };
    loadInitial();
  }, []);

  // 2. Cargar Almacenes y Labores al elegir Mina (Consolidado)
  useEffect(() => {
    // Siempre limpiamos al cambiar la mina para evitar inconsistencias mientras carga la API
    setAlmacenes([]);
    setLabores([]);
    setIdAlmacenDestino(0);
    setIdLabores([]);

    if (idMina > 0) {
      const loadMinaData = async () => {
        const res = await RequerimientosService.obtenerDataByMina(idMina);
        if (res.success) {
          setAlmacenes(res.data.almacenes);
          setLabores(res.data.labores);
        }
      };
      loadMinaData();
    }
  }, [idMina]);

  // 3. Lógica de Unidades al elegir Producto/Unidad
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

  // Auto-selección de unidad al elegir producto
  useEffect(() => {
    if (idProducto && !loadingCatalogs && productos.length > 0) {
      const prod = productos.find((p) => p.id_producto === idProducto);
      if (prod) {
        setIdUnidadMedida(prod.id_unidad_medida_base);
      }
    }
    // Al cambiar de producto, reseteamos el destino y comentario
    setIdProductoDestino(0);
    setComentarioItem("");
  }, [idProducto, loadingCatalogs, productos]);

  // Filtrar productos que ya están presentes en la lista de detalles
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      // Los productos consumibles pueden agregarse múltiples veces
      // mientras tengan destinos diferentes aún disponibles
      if (p.es_consumible) return true;

      // Los productos regulares solo se agregan una vez
      return !detalles.some((d) => d.id_producto === p.id_producto);
    });
  }, [productos, detalles]);

  // Destinos disponibles para el producto consumible seleccionado
  const destinosDisponibles = useMemo(() => {
    if (
      !productoSeleccionado ||
      !productoSeleccionado.es_consumible ||
      !productoSeleccionado.ids_categorias_consumidoras
    ) {
      return [];
    }

    const idsPermitidosStr =
      productoSeleccionado.ids_categorias_consumidoras.split(",");
    const idsPermitidos = idsPermitidosStr.map(Number);

    return productos.filter((p) => {
      // 1. Debe pertenecer a una categoría consumidora permitida
      const esCategoriaPermitida = idsPermitidos.includes(p.id_categoria);
      if (!esCategoriaPermitida) return false;

      // 2. No debe haber sido ya elegido para este mismo producto consumible en este formulario
      const yaElegido = detalles.some(
        (d) =>
          d.id_producto === productoSeleccionado.id_producto &&
          d.id_producto_destino === p.id_producto,
      );

      return !yaElegido;
    });
  }, [productoSeleccionado, productos, detalles]);

  // Agregar item a la lista
  const agregarItem = useCallback(() => {
    if (!idProducto || !idUnidadMedida || cantidad <= 0 || contenido <= 0) {
      notifyError("Complete los datos del producto");
      return;
    }

    // Validación adicional para consumibles
    if (productoSeleccionado?.es_consumible && !idProductoDestino) {
      notifyError(
        "Debe seleccionar un equipo de destino para este producto consumible",
      );
      return;
    }

    const nuevoItem: DTO_CrearRequerimientoDetalle = {
      id_producto: idProducto,
      id_unidad_medida: idUnidadMedida,
      cantidad_solicitada: cantidad,
      contenido_por_presentacion: contenido,
      comentario: comentarioItem,
      id_producto_destino: idProductoDestino > 0 ? idProductoDestino : null,
    };

    setDetalles((prev) => [...prev, nuevoItem]);

    // Limpiar item
    setIdProducto(0);
    setIdUnidadMedida(0);
    setCantidad(0);
    setContenido(1);
    setComentarioItem("");
    setIdProductoDestino(0);
  }, [
    idProducto,
    idUnidadMedida,
    cantidad,
    contenido,
    comentarioItem,
    idProductoDestino,
    productoSeleccionado,
    notifyError,
  ]);

  const eliminarItem = useCallback((index: number) => {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const actualizarCantidadItem = useCallback(
    (index: number, nvaCantidad: number) => {
      setDetalles((prev) => {
        const nvaLista = [...prev];
        if (nvaLista[index]) {
          nvaLista[index].cantidad_solicitada = nvaCantidad;
        }
        return nvaLista;
      });
    },
    [],
  );

  const actualizarContenidoItem = useCallback(
    (index: number, nvoContenido: number) => {
      setDetalles((prev) => {
        const nvaLista = [...prev];
        if (nvaLista[index]) {
          nvaLista[index].contenido_por_presentacion = nvoContenido;
        }
        return nvaLista;
      });
    },
    [],
  );

  // Submit Final
  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(null);

    const dto: DTO_CrearRequerimiento = {
      id_mina: idMina,
      id_almacen_destino: idAlmacenDestino,
      id_labores: idLabores.length > 0 ? idLabores : null,
      premura,
      fecha_entrega_requerida: fechaEntregaRequerida
        ? dayjs(fechaEntregaRequerida).format("YYYY-MM-DD")
        : null,
      detalles,
    };

    const validation = Schema_CrearRequerimiento.safeParse(dto);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setSubmitting(false);
      return;
    }

    // Validación manual de ítems con cantidad 0
    const tieneItemsEnCero = detalles.some(
      (d) => d.cantidad_solicitada <= 0 || d.contenido_por_presentacion <= 0,
    );
    if (tieneItemsEnCero) {
      setError(
        "Hay productos con cantidad o contenido igual o menor a 0 en la lista",
      );
      setSubmitting(false);
      return;
    }

    try {
      const res = await RequerimientosService.crear(dto);
      if (res.success) {
        notifySuccess("Requerimiento registrado correctamente");
        onSuccess(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Error al registrar requerimiento");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }, [
    idMina,
    idAlmacenDestino,
    idLabores,
    premura,
    fechaEntregaRequerida,
    detalles,
    onSuccess,
    notifySuccess,
  ]);

  return {
    state: {
      minas,
      almacenes,
      labores,
      productos,
      productosFiltrados,
      destinosDisponibles,
      unidades,
      idMina,
      setIdMina,
      idAlmacenDestino,
      setIdAlmacenDestino,
      idLabores,
      setIdLabores,
      premura,
      setPremura,
      fechaEntregaRequerida,
      setFechaEntregaRequerida,
      observacion,
      setObservacion,
      // Item
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
      idProductoDestino,
      setIdProductoDestino,
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
      actualizarCantidadItem,
      actualizarContenidoItem,
      handleSubmit,
    },
  };
};
