import dayjs from "dayjs";
import { useState, useEffect, useCallback, useMemo } from "react";
import { usePrint } from "../../../hooks/usePrint";
import { useNotify } from "../../../hooks/useNotify";
import { Schema_CrearRequerimiento } from "../service/atencion.requests";
import type {
  DTO_CrearRequerimiento,
  DTO_CrearRequerimientoDetalle,
} from "../service/atencion.requests";
import { Premura } from "../../../shared/enums/_generic/premura";
import type { RES_UnidadMedida } from "../../../service/responses/unidad-medida";
import { AtencionService } from "../service/atencion.service";
import type { RES_RequerimientoAlmacen } from "../../../service/responses/requerimientos-almacen/requerimiento-almacen";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_Producto } from "../../../service/responses/producto";
import type { RES_ActivoFijoDisponible } from "../../../service/responses/activo-fijo";
import type { RES_Labor } from "../../../service/responses/labor";
import type { RES_Empleado } from "../../../service/responses/empleado";
import type { RES_Contratista } from "../../../service/responses/contratista";
import { getCoincidencias } from "../../../shared/functions/get-coincidencias";

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
  const [loadingLabores, setLoadingLabores] = useState(false);
  const [loadingMinaData, setLoadingMinaData] = useState(false);
  const [loadingActivos, setLoadingActivos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadingCatalogs = loadingProductos || loadingUnidades || loadingLabores;

  // Catálogos
  const [empleados, setEmpleados] = useState<RES_Empleado[]>([]);
  const [contratistas, setContratistas] = useState<RES_Contratista[]>([]);
  const [verContratistas, setVerContratistas] = useState(true);
  const [labores, setLabores] = useState<RES_Labor[]>([]);
  const [productos, setProductos] = useState<RES_Producto[]>([]);
  const [unidades, setUnidades] = useState<RES_UnidadMedida[]>([]);
  const [activos, setActivos] = useState<RES_ActivoFijoDisponible[]>([]);
  const [evidencias, setEvidencias] = useState<File[]>([]);

  // Estado Formulario Cabecera
  const [idAlmacenDestino, setIdAlmacenDestino] = useState<number>(
    idAlmacenFijo || 0,
  );
  const [idLabor, setIdLabor] = useState<number>(0);
  const [idEmpleadoSolicitante, setIdEmpleadoSolicitante] = useState<number>(0);
  const [premura, setPremura] = useState<Premura>(Premura.Normal);
  const [fechaSolicitud, setFechaSolicitud] = useState<Date | null>(new Date());
  const [fechaEntregaRequerida, setFechaEntregaRequerida] =
    useState<Date | null>(null);
  const [observacion, setObservacion] = useState("");

  // Estado Formulario Detalle (Item actual)
  const [idProducto, setIdProducto] = useState<number>(0);
  const [idUnidadMedida, setIdUnidadMedida] = useState<number>(0);
  const [cantidad, setCantidad] = useState<number>(0);
  const [contenido, setContenido] = useState<number>(1);
  /**
   * Cálculo inteligente: cuando está activo, el campo `contenido` se interpreta
   * como "magnitud por ítem" (ej. 70 cm por cada Guía) y se permite su edición
   * incluso cuando la unidad del detalle coincide con la base del producto.
   * Caso típico: 11 guías de 70 cm cada una = 770 cm sin que el usuario tenga
   * que multiplicar a mano.
   */
  const [calculoInteligente, setCalculoInteligente] = useState<boolean>(false);
  const [comentarioItem, setComentarioItem] = useState("");
  const [paraMantenimientoItem, setParaMantenimientoItem] = useState(false);
  const [idActivoFijoDestino, setIdActivoFijoDestino] = useState<number>(0);

  // Lista de detalles agregados
  const [detalles, setDetalles] = useState<DTO_CrearRequerimientoDetalle[]>([]);

  // 1. Cargar Catálogos en paralelo al montar
  useEffect(() => {
    const loadCatalogs = async () => {
      setLoadingProductos(true);
      setLoadingUnidades(true);
      setLoadingLabores(true);
      setLoadingMinaData(true);
      setLoadingActivos(true);
      try {
        const [resProd, resUnid, resEmp, resAct, resCont, resLab] = await Promise.all([
          AuxService.get_productos(),
          AuxService.get_unidades_medida(),
          AuxService.get_empleados(),
          AuxService.get_activos_disponibles(),
          AuxService.get_contratistas(),
          AuxService.get_labores(),
        ]);

        if (resProd.success && resProd.data) setProductos(resProd.data);
        if (resUnid.success && resUnid.data) setUnidades(resUnid.data);
        if (resEmp.success && resEmp.data) setEmpleados(resEmp.data);
        if (resAct.success && resAct.data) setActivos(resAct.data);
        if (resCont.success && resCont.data) setContratistas(resCont.data);
        if (resLab.success && resLab.data) setLabores(resLab.data);
      } catch (err) {
        console.error("Error loading catalogs", err);
      } finally {
        setLoadingProductos(false);
        setLoadingUnidades(false);
        setLoadingLabores(false);
        setLoadingMinaData(false);
        setLoadingActivos(false);
      }
    };

    loadCatalogs();
  }, []);

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
    /**
     * Forzar contenido=1 solo cuando NO hay cálculo inteligente activo.
     * Si el cálculo inteligente está activo y las unidades coinciden con la
     * base del producto, el usuario es quien debe tipear la magnitud por ítem
     * (ej. 70 cm por Guía) — el sistema no puede asumirla.
     */
    if (sonUnidadesIdenticas && !calculoInteligente) {
      setContenido(1);
    }
  }, [sonUnidadesIdenticas, calculoInteligente]);

  /**
   * Al activar el checkbox de cálculo inteligente: si el contenido actual
   * provenía del auto-fill (==1) y las unidades son idénticas a la base,
   * lo reseteamos a 0 para forzar al usuario a ingresar la magnitud real
   * por ítem. Sin esto, el input quedaría con un placeholder engañoso.
   */
  const activarCalculoInteligente = useCallback((checked: boolean) => {
    setCalculoInteligente(checked);
    if (checked && sonUnidadesIdenticas && contenido === 1) {
      setContenido(0);
    }
  }, [sonUnidadesIdenticas, contenido]);

  // Auto-seleccionar contratista responsable al elegir una labor
  useEffect(() => {
    if (!idLabor || !verContratistas) return;
    const responsable = contratistas.find((c) => {
      if (!c.ids_labores_activas) return false;
      const ids = c.ids_labores_activas.split(",").map(Number);
      return ids.includes(idLabor);
    });
    if (responsable) {
      setIdEmpleadoSolicitante(responsable.id_contratista);
    }
  }, [idLabor, contratistas, verContratistas]);

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
    setCalculoInteligente(false);
  }, [idProducto, productos]);

  /**
   * Búsqueda tolerante (fuzzy + por tokens) del catálogo de productos en el Select.
   * Se aplica ENCIMA de `productosFiltrados` (que ya excluye productos ya
   * agregados, salvo consumibles). Cuando `productoBusqueda` está vacío,
   * devuelve la lista completa sin coste adicional.
   *
   * Permite al usuario escribir "gua", "guias", "guia 70cm" o con errores
   * de tipeo y obtener coincidencias fiables.
   */
  const [productoBusqueda, setProductoBusqueda] = useState<string>("");

  /**
   * Búsqueda tolerante del catálogo de unidades de medida. Misma lógica:
   * busca sobre `nombre` y `abreviatura` (ej. tipear "mtr" encuentra "Metro").
   */
  const [unidadBusqueda, setUnidadBusqueda] = useState<string>("");

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

  /**
   * Lista de productos que se muestra en el Select tras aplicar la búsqueda
   * tolerante. Si no hay query, devuelve la lista completa (filtrada por
   * duplicados), sin invocar getCoincidencias.
   */
  const productosVisibles = useMemo(() => {
    const q = productoBusqueda.trim();
    if (!q) return productosFiltrados;
    return getCoincidencias(productosFiltrados, q, {
      keys: ["nombre", "categoria"],
      fuseThreshold: 0.4,
    }).map((r) => r.item);
  }, [productosFiltrados, productoBusqueda]);

  /**
   * Lista de unidades de medida que se muestra en el Select tras la búsqueda
   * tolerante. Busca tanto por nombre completo (ej. "Centímetro") como por
   * abreviatura (ej. "cm").
   */
  const unidadesVisibles = useMemo(() => {
    const q = unidadBusqueda.trim();
    if (!q) return unidades;
    return getCoincidencias(unidades, q, {
      keys: ["nombre", "abreviatura"],
      fuseThreshold: 0.4,
    }).map((r) => r.item);
  }, [unidades, unidadBusqueda]);

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
    setCalculoInteligente(false);
    setComentarioItem("");
    setParaMantenimientoItem(false);
    setIdActivoFijoDestino(0);
    setProductoBusqueda("");
    setUnidadBusqueda("");
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
      id_empleado_solicitante:
        !verContratistas && idEmpleadoSolicitante > 0 ? idEmpleadoSolicitante : null,
      id_contratista_solicitante:
        verContratistas && idEmpleadoSolicitante > 0 ? idEmpleadoSolicitante : null,
      id_labor: idLabor > 0 ? idLabor : null,
      id_almacen_destino: idAlmacenDestino,
      premura,
      es_auditable: esAuditable,
      created_at: fechaSolicitud
        ? dayjs(fechaSolicitud).format("YYYY-MM-DD HH:mm:ss")
        : dayjs().format("YYYY-MM-DD HH:mm:ss"),
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
    idEmpleadoSolicitante,
    verContratistas,
    idLabor,
    idAlmacenDestino,
    premura,
    fechaEntregaRequerida,
    observacion,
    detalles,
    evidencias,
    onSuccess,
    notifySuccess,
    prepare,
    productos,
    fechaSolicitud,
  ]);

  return {
    state: {
      labores,
      productos,
      unidades,
      setUnidades,
      evidencias,
      setEvidencias,
      idAlmacenDestino,
      setIdAlmacenDestino,
      idLabor,
      setIdLabor,
      idEmpleadoSolicitante,
      setIdEmpleadoSolicitante,
      empleados,
      contratistas,
      verContratistas,
      setVerContratistas,
      premura,
      setPremura,
      fechaSolicitud,
      setFechaSolicitud,
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
      calculoInteligente,
      setCalculoInteligente: activarCalculoInteligente,
      comentarioItem,
      setComentarioItem,
      paraMantenimientoItem,
      setParaMantenimientoItem,
      idActivoFijoDestino,
      setIdActivoFijoDestino,
      productoBusqueda,
      setProductoBusqueda,
      unidadBusqueda,
      setUnidadBusqueda,
      activos,
      detalles,
    },
    derived: {
      sonUnidadesIdenticas,
      productoSeleccionado,
      canAdd:
        idProducto &&
        idUnidadMedida &&
        cantidad > 0 &&
        contenido > 0,
      productosFiltrados,
      productosVisibles,
      unidadesVisibles,
    },
    status: {
      submitting,
      loadingCatalogs,
      loadingLabores,
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
