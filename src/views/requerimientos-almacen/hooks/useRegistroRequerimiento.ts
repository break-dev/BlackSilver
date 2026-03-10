import { useState, useEffect, useCallback } from "react";
import { notifications } from "@mantine/notifications";
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
} from "../services/requerimientos.responses";
import { Premura } from "../../../shared/enums/otros";

interface Props {
  onSuccess: () => void;
}

export const useRegistroRequerimiento = ({ onSuccess }: Props) => {
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

  // Lista de detalles agregados
  const [detalles, setDetalles] = useState<DTO_CrearRequerimientoDetalle[]>([]);

  // 1. Cargar Catálogos Iniciales
  useEffect(() => {
    const loadInitial = async () => {
      setLoadingCatalogs(true);
      try {
        const [resMinas, resProds, resUnits] = await Promise.all([
          RequerimientosService.listarMinas(),
          RequerimientosService.listarProductos(),
          RequerimientosService.listarUnidades(),
        ]);
        if (resMinas.success) setMinas(resMinas.data);
        if (resProds.success) setProductos(resProds.data);
        if (resUnits.success) setUnidades(resUnits.data);
      } finally {
        setLoadingCatalogs(false);
      }
    };
    loadInitial();
  }, []);

  // 2. Cargar Almacenes y Labores al elegir Mina
  useEffect(() => {
    if (idMina > 0) {
      const loadMinaData = async () => {
        const [resAlms, resLabs] = await Promise.all([
          RequerimientosService.listarAlmacenesPorMina(idMina),
          RequerimientosService.listarLaboresPorMina(idMina),
        ]);
        if (resAlms.success) setAlmacenes(resAlms.data);
        if (resLabs.success) setLabores(resLabs.data);
      };
      loadMinaData();
    } else {
      setAlmacenes([]);
      setLabores([]);
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

  // Agregar item a la lista
  const agregarItem = useCallback(() => {
    if (!idProducto || !idUnidadMedida || cantidad <= 0 || contenido <= 0) {
      notifications.show({
        title: "Error",
        message: "Complete los datos del producto",
        color: "red",
      });
      return;
    }
    const nuevoItem: DTO_CrearRequerimientoDetalle = {
      id_producto: idProducto,
      id_unidad_medida: idUnidadMedida,
      cantidad_solicitada: cantidad,
      contenido_por_presentacion: contenido,
      comentario: comentarioItem,
    };
    setDetalles((prev) => [...prev, nuevoItem]);
    // Limpiar item
    setIdProducto(0);
    setIdUnidadMedida(0);
    setCantidad(0);
    setContenido(1);
    setComentarioItem("");
  }, [idProducto, idUnidadMedida, cantidad, contenido, comentarioItem]);

  const eliminarItem = useCallback((index: number) => {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Submit Final
  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(null);

    const dto: DTO_CrearRequerimiento = {
      id_mina: idMina,
      id_almacen_destino: idAlmacenDestino,
      id_labores: idLabores.length > 0 ? idLabores : null,
      premura,
      fecha_entrega_requerida:
        fechaEntregaRequerida?.toISOString().split("T")[0] || null,
      detalles,
    };

    const validation = Schema_CrearRequerimiento.safeParse(dto);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setSubmitting(false);
      return;
    }

    try {
      const res = await RequerimientosService.crear(dto);
      if (res.success) {
        notifications.show({
          title: "Éxito",
          message: "Requerimiento registrado correctamente",
          color: "teal",
        });
        onSuccess();
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
  ]);

  return {
    state: {
      minas,
      almacenes,
      labores,
      productos,
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
    },
  };
};
