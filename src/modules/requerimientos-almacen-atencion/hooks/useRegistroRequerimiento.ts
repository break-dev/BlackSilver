import dayjs from "dayjs";
import { useState, useEffect, useCallback, useMemo } from "react";
import { usePrint } from "../../../hooks/usePrint";
import { useNotify } from "../../../hooks/useNotify";
import { Schema_CrearRequerimiento } from "../service/atencion.requests";
import type {
  DTO_CrearRequerimiento,
  DTO_CrearRequerimientoDetalle,
} from "../service/atencion.requests";
import type { RES_Labor, RES_Mina } from "../service/atencion.responses";
import { Premura } from "../../../shared/enums/_generic/premura";
import type { RES_UnidadMedida } from "../../../service/responses/unidad-medida";
import { AtencionService } from "../service/atencion.service";
import type { RES_RequerimientoAlmacen } from "../../../service/responses/requerimientos-almacen/requerimiento-almacen";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_Producto } from "../../../service/responses/producto";
import type { RES_ActivoFijoDisponible } from "../../../service/responses/activo-fijo";

interface Props {
  onSuccess: (
    item: RES_RequerimientoAlmacen,
    printerTarget: string,
    printerWin: Window | null,
  ) => void;
  idAlmacenFijo?: number;
}

export const useRegistroRequerimiento = ({
  onSuccess,
  idAlmacenFijo,
}: Props) => {
  const { prepare } = usePrint();
  const { notifySuccess, notifyError } = useNotify();
  const [submitting, setSubmitting] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [loadingMinas, setLoadingMinas] = useState(false);
  const [loadingMinaData, setLoadingMinaData] = useState(false);
  const [loadingActivos, setLoadingActivos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadingCatalogs = loadingProductos || loadingUnidades;

  // Catálogos
  const [minas, setMinas] = useState<RES_Mina[]>([]);
  const [responsables, setResponsables] = useState<
    { id_contratista: number; nombre_completo: string }[]
  >([]);
  const [labores, setLabores] = useState<RES_Labor[]>([]);
  const [productos, setProductos] = useState<RES_Producto[]>([]);
  const [unidades, setUnidades] = useState<RES_UnidadMedida[]>([]);
  const [activos, setActivos] = useState<RES_ActivoFijoDisponible[]>([]);
  const [evidencias, setEvidencias] = useState<File[]>([]);

  // Estado Formulario Cabecera
  const [idAlmacenDestino, setIdAlmacenDestino] = useState<number>(
    idAlmacenFijo || 0,
  );
  const [idMina, setIdMina] = useState<number>(0);
  const [idContratistaSolicitante, setIdContratistaSolicitante] =
    useState<number>(0);
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
  const [paraMantenimientoItem, setParaMantenimientoItem] = useState(false);
  const [idActivoFijoDestino, setIdActivoFijoDestino] = useState<number>(0);

  // Lista de detalles agregados
  const [detalles, setDetalles] = useState<DTO_CrearRequerimientoDetalle[]>([]);

  // 1. Cargar Productos y Unidades en paralelo (sin bloquearse secuencialmente)
  useEffect(() => {
    const loadProductos = async () => {
      setLoadingProductos(true);
      try {
        const res = await AuxService.get_productos({
          con_categorias_consumidoras: true,
        });
        if (res.success && res.data) {
          setProductos(res.data);
        }
      } finally {
        setLoadingProductos(false);
      }
    };

    const loadUnidades = async () => {
      setLoadingUnidades(true);
      try {
        const res = await AuxService.get_unidades_medida();
        if (res.success && res.data) {
          setUnidades(res.data);
        }
      } finally {
        setLoadingUnidades(false);
      }
    };

    loadProductos();
    loadUnidades();
  }, []);

  // 2. Cargar minas cuando cambia almacén
  useEffect(() => {
    if (idAlmacenDestino > 0) {
      const loadMinas = async () => {
        setLoadingMinas(true);
        try {
          const res =
            await AtencionService.obtenerMinasPorAlmacen(idAlmacenDestino);
          if (res.success) {
            setMinas(res.data);
            // Auto seleccionar primera mina si no hay una seleccionada
            if (res.data.length > 0 && idMina === 0) {
              setIdMina(res.data[0].id_mina);
            }
          }
        } finally {
          setLoadingMinas(false);
        }
      };
      loadMinas();
    } else {
      setMinas([]);
      setIdMina(0);
    }
    // Remove idMina from dependencies to prevent double-fetching when auto-selecting
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAlmacenDestino]);

  // 3. Cargar Responsables, Labores y Activos al elegir Mina
  useEffect(() => {
    setIdContratistaSolicitante(0);
    setIdLabores([]);
    setResponsables([]);
    setLabores([]);

    if (idMina > 0) {
      const loadMinaData = async () => {
        setLoadingMinaData(true);
        try {
          const res = await AtencionService.obtenerDataByMina(idMina);
          if (res.success) {
            setResponsables(res.data.responsables);
            setLabores(res.data.labores);

            if (res.data.responsables.length > 0) {
              setIdContratistaSolicitante(
                res.data.responsables[0].id_contratista,
              );
            }
          }
        } finally {
          setLoadingMinaData(false);
        }
      };

      loadMinaData();
    } else {
      // Si no hay mina seleccionada, cargar todos los contratistas
      const loadAllContratistas = async () => {
        setLoadingMinaData(true);
        try {
          const res = await AuxService.get_contratistas();
          if (res.success && res.data) {
            const mapped = res.data.map((c) => ({
              id_contratista: c.id_contratista,
              nombre_completo: `${c.nombre} ${c.apellido}`.trim(),
            }));
            setResponsables(mapped);
            if (mapped.length > 0) {
              setIdContratistaSolicitante(mapped[0].id_contratista);
            }
          }
        } finally {
          setLoadingMinaData(false);
        }
      };
      loadAllContratistas();
    }
    // Remove idEmpleadoSolicitante from dependencies to prevent double-fetching
  }, [idMina]);

  // Cargar activos fijos disponibles
  useEffect(() => {
    const loadActivos = async () => {
      setLoadingActivos(true);
      try {
        const res = await AuxService.get_activos_disponibles();
        if (res.success && res.data) {
          setActivos(res.data);
        }
      } finally {
        setLoadingActivos(false);
      }
    };
    loadActivos();
  }, []);

  // 4. Lógica de Unidades al elegir Producto/Unidad
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
    if (idProducto && productos.length > 0) {
      const prod = productos.find((p) => p.id_producto === idProducto);
      if (prod) {
        setIdUnidadMedida(prod.id_unidad_medida_base);
      }
    }
    // Al cambiar de producto, reseteamos el comentario y mantenimiento
    setComentarioItem("");
    setParaMantenimientoItem(false);
    setIdActivoFijoDestino(0);
  }, [idProducto, productos]);

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

  // Agregar item a la lista
  const agregarItem = useCallback(() => {
    if (!idProducto || !idUnidadMedida || cantidad <= 0 || contenido <= 0) {
      notifyError("Complete los datos del producto");
      return;
    }

    if (paraMantenimientoItem && !idActivoFijoDestino) {
      notifyError("Debe seleccionar el equipo destino para mantenimiento");
      return;
    }

    let finalComentario = comentarioItem;
    if (paraMantenimientoItem && idActivoFijoDestino > 0) {
      const activo = activos.find((a) => a.id_activo === idActivoFijoDestino);
      finalComentario = activo
        ? `Para el mantenimiento de ${activo.producto} ${activo.correlativo}`
        : `Para el mantenimiento de Equipo #${idActivoFijoDestino}`;
    }

    const nuevoItem: DTO_CrearRequerimientoDetalle = {
      id_producto: idProducto,
      id_unidad_medida: idUnidadMedida,
      cantidad_solicitada: cantidad,
      contenido_por_presentacion: contenido,
      comentario: finalComentario,
      para_mantenimiento: paraMantenimientoItem,
      id_activo_fijo_destino:
        paraMantenimientoItem && idActivoFijoDestino > 0
          ? idActivoFijoDestino
          : null,
    };

    setDetalles((prev) => [...prev, nuevoItem]);

    // Limpiar item
    setIdProducto(0);
    setIdUnidadMedida(0);
    setCantidad(0);
    setContenido(1);
    setComentarioItem("");
    setParaMantenimientoItem(false);
    setIdActivoFijoDestino(0);
  }, [
    idProducto,
    idUnidadMedida,
    cantidad,
    contenido,
    comentarioItem,
    paraMantenimientoItem,
    idActivoFijoDestino,
    activos,
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

    const esAuditable = detalles.some((d) => {
      const prod = productos.find((p) => p.id_producto === d.id_producto);
      return prod?.es_auditable;
    });

    const dto: DTO_CrearRequerimiento = {
      id_contratista_solicitante:
        idContratistaSolicitante > 0 ? idContratistaSolicitante : null,
      id_mina: idMina > 0 ? idMina : null,
      id_almacen_destino: idAlmacenDestino,
      id_labores: idLabores.length > 0 ? idLabores : null,
      premura,
      es_auditable: esAuditable,
      fecha_entrega_requerida: fechaEntregaRequerida
        ? dayjs(fechaEntregaRequerida).format("YYYY-MM-DD")
        : dayjs().add(2, "days").format("YYYY-MM-DD"),
      observacion,
      detalles,
      evidencias: evidencias.length > 0 ? evidencias : null,
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

    const printerTarget = "NuevoRequerimientoPrinter";
    const printerWin = prepare(printerTarget);

    try {
      const res = await AtencionService.registrarRequerimiento(dto);
      if (res.success) {
        notifySuccess("Requerimiento registrado correctamente");
        onSuccess(res.data, printerTarget, printerWin);
      } else {
        printerWin?.close();
        setError(res.message);
      }
    } catch (err) {
      printerWin?.close();
      setError("Error al registrar requerimiento");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }, [
    idContratistaSolicitante,
    idMina,
    idAlmacenDestino,
    idLabores,
    premura,
    fechaEntregaRequerida,
    observacion,
    detalles,
    evidencias,
    onSuccess,
    notifySuccess,
    prepare,
    productos,
  ]);

  return {
    state: {
      minas,
      labores,
      productos,
      unidades,
      setUnidades,
      evidencias,
      setEvidencias,
      idAlmacenDestino,
      setIdAlmacenDestino,
      idMina,
      setIdMina,
      idContratistaSolicitante,
      setIdContratistaSolicitante,
      responsables,
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
      paraMantenimientoItem,
      setParaMantenimientoItem,
      idActivoFijoDestino,
      setIdActivoFijoDestino,
      activos,
      detalles,
    },
    derived: {
      sonUnidadesIdenticas,
      productoSeleccionado,
      canAdd: idProducto && idUnidadMedida && cantidad > 0,
      productosFiltrados,
    },
    status: {
      submitting,
      loadingCatalogs,
      loadingMinas,
      loadingMinaData,
      loadingActivos,
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
