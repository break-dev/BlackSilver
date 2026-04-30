import { useState, useCallback, useEffect, useMemo } from "react";
import type {
  DTO_CotizacionRequest,
  DTO_ProductoComparativo,
  DTO_CotizacionDetalle,
  DTO_RegistrarComparativo,
} from "../service/cotizaciones.requests";
import type { RES_Empresa } from "../service/cotizaciones.responses";
import { CotizacionesService } from "../service/cotizaciones.service";
import { useNotify } from "../../../hooks/useNotify";
import {
  Estado_Cotizacion,
  Estado_Cotizacion_Detalle,
} from "../../../shared/enums/cotizacion/cotizacion";
import { MetodoPago } from "../../../shared/enums/_generic/metodo-pago";
import { TipoDespachoCompra } from "../../../shared/enums/_generic/tipo-despacho-compra";
import { Periodo } from "../../../shared/enums/_generic/periodo";
import { TipoEntidad } from "../../../shared/enums/_generic/tipo-entidad";
import type { RES_Proveedor } from "../../../service/responses/proveedor";
import type { RES_UnidadMedida } from "../../../service/responses/unidad-medida";
import type { RES_Producto } from "../../../service/responses/producto";
import type { RES_Almacen } from "../../../service/responses/almacen";
import type { RES_Comparativo } from "../../../service/responses/cotizaciones/cotizacion";

interface MaestrosState {
  proveedores: RES_Proveedor[];
  unidades: RES_UnidadMedida[];
  catalogo: RES_Producto[];
  empresas: RES_Empresa[];
  almacenes: RES_Almacen[];
}

/** Días equivalentes por período de tiempo de entrega */
const DIAS_POR_PERIODO: Record<Periodo, number> = {
  [Periodo.Diario]: 1,
  [Periodo.Semanal]: 7,
  [Periodo.Mensual]: 30,
  [Periodo.Anual]: 365,
  [Periodo.Ninguno]: 0,
};

/** Detalle inicial vacío para un nuevo producto en la tabla */
const detalleVacio = (
  id_producto: number,
  id_unidad_medida: number,
): DTO_CotizacionDetalle => ({
  id_producto,
  id_unidad_medida,
  // Almacén y despacho (el usuario completa)
  id_almacen_recepcionista: 0,
  tipo_despacho: TipoDespachoCompra.Envio,
  lugar_recojo: null,
  // Tiempo de entrega por defecto: 1 semana
  tiempo_entrega: 1,
  tiempo_entrega_periodo: Periodo.Semanal,
  tiempo_entrega_dias: 7,
  // Cantidades y precios
  cantidad: 1,
  contenido_por_presentacion: 1,
  cantidad_base: 1,
  precio_unitario: 0,
  precio_unitario_base: 0,
  no_cotiza: false,
  comentario: null,
  estado: Estado_Cotizacion_Detalle.Pendiente,
});

/**
 * Recalcula los totales de una cotización dado el subtotal de los detalles activos.
 * costo_flete y otros_gastos se consideran netos (antes de IGV).
 */
function recalcularTotales(
  cot: DTO_CotizacionRequest,
  detalles?: DTO_CotizacionDetalle[],
): Pick<
  DTO_CotizacionRequest,
  "total_antes_igv" | "monto_igv" | "total_despues_igv"
> {
  const items = detalles ?? cot.detalles;
  const subtotal = items.reduce((acc, d) => {
    if (d.no_cotiza) return acc;
    return acc + d.cantidad * d.precio_unitario;
  }, 0);

  const base = subtotal + (cot.costo_flete ?? 0) + (cot.otros_gastos ?? 0);
  const factor = 1 + cot.porcentaje_igv / 100;

  if (cot.incluye_igv) {
    const total_antes = base / factor;
    const monto_igv = base - total_antes;
    return { total_antes_igv: total_antes, monto_igv, total_despues_igv: base };
  } else {
    const monto_igv = base * (cot.porcentaje_igv / 100);
    const total_despues_igv = base + monto_igv;
    return { total_antes_igv: base, monto_igv, total_despues_igv };
  }
}

export const useRegistroCotizacion = (
  onSuccess: (
    data: RES_Comparativo[],
    payload: DTO_RegistrarComparativo,
    currentMaestros: MaestrosState,
  ) => void,
) => {
  const { notify } = useNotify();
  const [loading, setLoading] = useState(false);
  const [loadingMaestros, setLoadingMaestros] = useState(true);

  const [maestros, setMaestros] = useState<MaestrosState>({
    proveedores: [],
    unidades: [],
    catalogo: [],
    empresas: [],
    almacenes: [],
  });

  const [productos, setProductos] = useState<DTO_ProductoComparativo[]>([]);
  const [cotizaciones, setCotizaciones] = useState<DTO_CotizacionRequest[]>([]);

  const [wizardAprobacionOpened, setWizardAprobacionOpened] = useState(false);
  const [wizardPayload, setWizardPayload] =
    useState<DTO_RegistrarComparativo | null>(null);

  const [copySource, setCopySource] = useState<{
    cotIndex: number;
    rowIndex: number;
    id_producto: number;
    data: Partial<DTO_CotizacionDetalle>;
  } | null>(null);

  const iniciarCopia = useCallback(
    (cotIndex: number, rowIndex: number, id_producto: number) => {
      const source = cotizaciones[cotIndex]?.detalles[rowIndex];
      if (!source) return;

      setCopySource({
        cotIndex,
        rowIndex,
        id_producto,
        data: {
          id_unidad_medida: source.id_unidad_medida,
          cantidad: source.cantidad,
          contenido_por_presentacion: source.contenido_por_presentacion,
          cantidad_base: source.cantidad_base,
          precio_unitario: source.precio_unitario,
          precio_unitario_base: source.precio_unitario_base,
          id_almacen_recepcionista: source.id_almacen_recepcionista,
          tipo_despacho: source.tipo_despacho,
          tiempo_entrega: source.tiempo_entrega,
          tiempo_entrega_periodo: source.tiempo_entrega_periodo,
          tiempo_entrega_dias: source.tiempo_entrega_dias,
          lugar_recojo: source.lugar_recojo,
        },
      });
    },
    [cotizaciones],
  );

  const cancelarCopia = useCallback(() => setCopySource(null), []);

  const pegarCopia = useCallback(
    (targetCotIndex: number, targetRowIndex: number) => {
      if (!copySource) return;

      setCotizaciones((prev) => {
        const p = [...prev];
        const cot = { ...p[targetCotIndex] };
        const detalles = [...cot.detalles];

        detalles[targetRowIndex] = {
          ...detalles[targetRowIndex],
          ...copySource.data,
        };

        cot.detalles = detalles;
        Object.assign(cot, recalcularTotales(cot));
        p[targetCotIndex] = cot;
        return p;
      });

      setCopySource(null); // Limpiar copia después de pegar (UX solicitada)
      notify({ type: "success", content: "Datos copiados con éxito." });
    },
    [copySource, notify],
  );

  // Carga inicial de maestros
  useEffect(() => {
    const cargarMaestros = async () => {
      try {
        setLoadingMaestros(true);
        const [resProv, resUni, resProd, resEmp, resAlm] = await Promise.all([
          CotizacionesService.get_proveedores_maestro(),
          CotizacionesService.get_unidades_medida_maestro(),
          CotizacionesService.get_productos_maestro(),
          CotizacionesService.get_empresas_maestro(),
          CotizacionesService.get_almacenes_maestro(),
        ]);

        setMaestros({
          proveedores: resProv.success ? resProv.data : [],
          unidades: resUni.success ? resUni.data : [],
          catalogo: resProd.success ? resProd.data : [],
          empresas: resEmp.success ? resEmp.data : [],
          almacenes: resAlm.success ? resAlm.data : [],
        });
      } catch (error) {
        console.error("Error al cargar maestros en hook", error);
      } finally {
        setLoadingMaestros(false);
      }
    };
    cargarMaestros();
  }, []);

  // Paso 1: Toggle de producto en el comparativo
  const toggleProductoEnComparador = useCallback(
    (id_producto: number) => {
      setProductos((prev) => {
        const existe = prev.some((p) => p.id_producto === id_producto);

        if (existe) {
          const tieneDatos = cotizaciones.some((cot) => {
            return cot.detalles.some(
              (d) =>
                d.id_producto === id_producto &&
                (d.precio_unitario > 0 ||
                  (d.comentario && d.comentario.trim() !== ""))
            );
          });
          if (tieneDatos) return prev;

          const nuevosProds = prev.filter((p) => p.id_producto !== id_producto);
          setCotizaciones((prevCots) =>
            prevCots.map((cot) => ({
              ...cot,
              detalles: cot.detalles.filter(
                (d) => d.id_producto !== id_producto,
              ),
            })),
          );
          return nuevosProds;
        } else {
          const maestro = maestros.catalogo.find(
            (m) => m.id_producto === id_producto,
          );
          const idUnidadBase = maestro?.id_unidad_medida_base || 1;

          setCotizaciones((prevCots) =>
            prevCots.map((cot) => ({
              ...cot,
              detalles: [
                ...cot.detalles,
                detalleVacio(id_producto, idUnidadBase),
              ],
            })),
          );
          return [...prev, { id_producto, id_solicitud_detalle: null }];
        }
      });
    },
    [maestros.catalogo, cotizaciones],
  );

  // Paso 2: Añadir nueva columna de cotización
  const agregarCotizacion = useCallback(() => {
    setCotizaciones((prev) => {
      const nuevaCot: DTO_CotizacionRequest = {
        id_proveedor: 0,
        tipo_entidad_proveedor: TipoEntidad.Juridica,
        empresas_ids: [],
        moneda: "Soles",
        metodo_pago: MetodoPago.Contado,
        fecha_vencimiento_pago: null,
        costo_flete: 0,
        otros_gastos: 0,
        total_antes_igv: 0,
        incluye_igv: true,
        porcentaje_igv: 18,
        monto_igv: 0,
        total_despues_igv: 0,
        observacion: null,
        estado: Estado_Cotizacion.Generada,
        detalles: productos.map((p) => {
          const maestro = maestros.catalogo.find(
            (m) => m.id_producto === p.id_producto,
          );
          return detalleVacio(
            p.id_producto,
            maestro?.id_unidad_medida_base || 1,
          );
        }),
      };
      return [...prev, nuevaCot];
    });
  }, [productos, maestros.catalogo]);

  const eliminarCotizacion = useCallback((index: number) => {
    setCotizaciones((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const eliminarFilaProducto = useCallback((rowIndex: number) => {
    setProductos((prev) => prev.filter((_, i) => i !== rowIndex));
    setCotizaciones((prevCots) =>
      prevCots.map((cot) => ({
        ...cot,
        detalles: cot.detalles.filter((_, i) => i !== rowIndex),
      }))
    );
  }, []);

  // Actualización de cabeceras (incluyendo costo_flete y otros_gastos)
  const updateCotizacionHeader = useCallback(
    <K extends keyof DTO_CotizacionRequest>(
      index: number,
      field: K,
      value: DTO_CotizacionRequest[K],
    ) => {
      setCotizaciones((prev) => {
        const p = [...prev];
        const target = { ...p[index], [field]: value };

        // Recalcular totales cuando cambian campos que los afectan
        const afectaTotales = (
          [
            "incluye_igv",
            "porcentaje_igv",
            "costo_flete",
            "otros_gastos",
          ] as string[]
        ).includes(field as string);
        if (afectaTotales) {
          Object.assign(target, recalcularTotales(target));
        }

        if ((field as string) === "estado") {
          const isAprobado = value === Estado_Cotizacion.Aprobada;
          const hasHabiles = target.detalles.some((d) => !d.no_cotiza);
          target.estado =
            isAprobado && !hasHabiles
              ? Estado_Cotizacion.Generada
              : (value as Estado_Cotizacion);
        }

        p[index] = target;
        return p;
      });
    },
    [],
  );

  const duplicarFilaProducto = useCallback((rowIndex: number) => {
    setProductos((prev) => {
      const p = [...prev];
      p.splice(rowIndex + 1, 0, { ...p[rowIndex] });
      return p;
    });
    setCotizaciones((prevCots) =>
      prevCots.map((cot) => {
        const c = { ...cot };
        const detalles = [...c.detalles];
        const clone = { ...detalles[rowIndex], estado: Estado_Cotizacion_Detalle.Pendiente };
        detalles.splice(rowIndex + 1, 0, clone);
        c.detalles = detalles;
        return c;
      })
    );
  }, []);

  // Actualización de detalles (incluyendo almacén, despacho, tiempo de entrega)
  const updateCotizacionDetail = useCallback(
    <K extends keyof DTO_CotizacionDetalle>(
      cotIndex: number,
      rowIndex: number,
      field: K,
      value: DTO_CotizacionDetalle[K],
    ) => {
      setCotizaciones((prev) => {
        const p = [...prev];
        const cot = { ...p[cotIndex] };

        const detalles = [...cot.detalles];
        const upd = { ...detalles[rowIndex], [field]: value };
        const prodId = upd.id_producto;

          // Si cambia la unidad y coincide con la base, resetear contenido
          if (field === "id_unidad_medida") {
            const maestro = maestros.catalogo.find(
              (m) => m.id_producto === prodId,
            );
            if (maestro && Number(value) === maestro.id_unidad_medida_base) {
              upd.contenido_por_presentacion = 1;
            }
          }

          // Si cambia el período o la cantidad de tiempo, recalcular días
          if (
            field === "tiempo_entrega_periodo" ||
            field === "tiempo_entrega"
          ) {
            upd.tiempo_entrega_dias =
              upd.tiempo_entrega *
              (DIAS_POR_PERIODO[upd.tiempo_entrega_periodo] ?? 1);
          }

          // Si el tipo de despacho deja de ser Recojo, limpiar lugar
          if (
            field === "tipo_despacho" &&
            value !== TipoDespachoCompra.Recojo
          ) {
            upd.lugar_recojo = null;
          }

          upd.cantidad_base = upd.cantidad * upd.contenido_por_presentacion;
          upd.precio_unitario_base =
            upd.contenido_por_presentacion > 0
              ? Number(
                  (
                    upd.precio_unitario / upd.contenido_por_presentacion
                  ).toFixed(2),
                )
              : 0;
          detalles[rowIndex] = upd;
          cot.detalles = detalles;

        // Estado de la cotización según aprobaciones en detalles
        if ((field as string) === "estado") {
          const anyAprobado = detalles.some(
            (d) => d.estado === Estado_Cotizacion_Detalle.Aprobado,
          );
          cot.estado = anyAprobado
            ? Estado_Cotizacion.Aprobada
            : Estado_Cotizacion.Generada;
          if (!anyAprobado) {
            cot.detalles = detalles.map((d) => ({
              ...d,
              estado: d.no_cotiza ? null : Estado_Cotizacion_Detalle.Pendiente,
            }));
          }
        }

        Object.assign(cot, recalcularTotales(cot));
        p[cotIndex] = cot;
        return p;
      });
    },
    [maestros.catalogo],
  );

  const toggleCotizacionNoCotiza = useCallback(
    (cotIndex: number, rowIndex: number) => {
      setCotizaciones((prev) => {
        const p = [...prev];
        const cot = { ...p[cotIndex] };

        const detalles = [...cot.detalles];
        const d = detalles[rowIndex];
        const noC = !d.no_cotiza;
        detalles[rowIndex] = {
          ...d,
          no_cotiza: noC,
          estado: noC ? null : Estado_Cotizacion_Detalle.Pendiente,
        };

        cot.detalles = detalles;

        const anyAprobado = detalles.some(
          (d) => d.estado === Estado_Cotizacion_Detalle.Aprobado,
        );
        cot.estado = anyAprobado
          ? Estado_Cotizacion.Aprobada
          : Estado_Cotizacion.Generada;
        if (!anyAprobado) {
          cot.detalles = detalles.map((d) => ({
            ...d,
            estado: d.no_cotiza ? null : Estado_Cotizacion_Detalle.Pendiente,
          }));
        }

        Object.assign(cot, recalcularTotales(cot));
        p[cotIndex] = cot;
        return p;
      });
    },
    [],
  );

  const updateGlobalLogistica = useCallback(
    (
      cotIndex: number,
      data: {
        id_almacen_recepcionista: number;
        tipo_despacho: TipoDespachoCompra;
        tiempo_entrega: number;
        tiempo_entrega_periodo: Periodo;
      },
    ) => {
      setCotizaciones((prev) => {
        const p = [...prev];
        const cot = { ...p[cotIndex] };
        const dias =
          data.tiempo_entrega * (DIAS_POR_PERIODO[data.tiempo_entrega_periodo] ?? 1);

        cot.detalles = cot.detalles.map((d) => ({
          ...d,
          id_almacen_recepcionista: data.id_almacen_recepcionista,
          tipo_despacho: data.tipo_despacho,
          tiempo_entrega: data.tiempo_entrega,
          tiempo_entrega_periodo: data.tiempo_entrega_periodo,
          tiempo_entrega_dias: dias,
          // Si el tipo de despacho no es recojo, limpiamos el lugar de recojo
          lugar_recojo:
            data.tipo_despacho === TipoDespachoCompra.Recojo
              ? d.lugar_recojo
              : null,
        }));

        p[cotIndex] = cot;
        return p;
      });
    },
    [],
  );

  const handleSave = async () => {
    if (cotizaciones.length === 0) {
      notify({ type: "info", content: "Debe añadir al menos una cotización." });
      return;
    }
    if (cotizaciones.some((c) => c.id_proveedor === 0)) {
      notify({
        type: "info",
        content: "Todas las cotizaciones deben tener un proveedor asignado.",
      });
      return;
    }
    if (cotizaciones.some((c) => c.empresas_ids.length === 0)) {
      notify({
        type: "info",
        content:
          "Todas las cotizaciones deben tener al menos una empresa compradora seleccionada.",
      });
      return;
    }
    if (
      cotizaciones.some(
        (c) =>
          c.metodo_pago === MetodoPago.Credito && !c.fecha_vencimiento_pago,
      )
    ) {
      notify({
        type: "info",
        content:
          "Si el método es crédito, debe asignar una fecha de vencimiento.",
      });
      return;
    }
    if (
      cotizaciones.some(
        (c) => c.detalles.filter((d) => !d.no_cotiza).length === 0,
      )
    ) {
      notify({
        type: "info",
        content: "Cada proveedor debe cotizar al menos un producto.",
      });
      return;
    }
    if (
      cotizaciones.some((c) =>
        c.detalles.some((d) => !d.no_cotiza && d.precio_unitario <= 0),
      )
    ) {
      notify({
        type: "info",
        content:
          "Todos los productos habilitados deben tener un precio mayor a 0.",
      });
      return;
    }
    // Validar que todos los detalles habilitados tengan almacén seleccionado
    if (
      cotizaciones.some((c) =>
        c.detalles.some(
          (d) => !d.no_cotiza && d.id_almacen_recepcionista === 0,
        ),
      )
    ) {
      notify({
        type: "info",
        content:
          "Debe seleccionar el almacén recepcionista para todos los productos.",
      });
      return;
    }
    // Validar lugar de recojo cuando el tipo de despacho es Recojo
    if (
      cotizaciones.some((c) =>
        c.detalles.some(
          (d) =>
            !d.no_cotiza &&
            d.tipo_despacho === TipoDespachoCompra.Recojo &&
            !d.lugar_recojo?.trim(),
        ),
      )
    ) {
      notify({
        type: "info",
        content:
          "Debe ingresar el lugar de recojo para los productos con tipo de despacho 'Recojo'.",
      });
      return;
    }

    const tieneAprobadas = cotizaciones.some(
      (c) => c.estado === Estado_Cotizacion.Aprobada,
    );

    const payload: DTO_RegistrarComparativo = {
      productos,
      cotizaciones: cotizaciones.map((c) => {
        let fechaStr = null;
        if (c.metodo_pago === MetodoPago.Credito && c.fecha_vencimiento_pago) {
          const d = new Date(c.fecha_vencimiento_pago as unknown as string);
          if (!isNaN(d.getTime())) {
            fechaStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          }
        }
        return {
          ...c,
          fecha_vencimiento_pago: fechaStr,
          costo_flete: Number(c.costo_flete.toFixed(2)),
          otros_gastos: Number(c.otros_gastos.toFixed(2)),
          total_antes_igv: Number(c.total_antes_igv.toFixed(2)),
          monto_igv: Number(c.monto_igv.toFixed(2)),
          total_despues_igv: Number(c.total_despues_igv.toFixed(2)),
          detalles: c.detalles
            .filter((d) => !d.no_cotiza)
            .map((d) => ({
              ...d,
              precio_unitario_base: Number(d.precio_unitario_base.toFixed(2)),
              cantidad_base: Number(d.cantidad_base.toFixed(2)),
            })),
        };
      }),
    };

    if (tieneAprobadas) {
      setWizardPayload(payload);
      setWizardAprobacionOpened(true);
      return;
    }

    setLoading(true);
    try {
      const resp = await CotizacionesService.registrar_comparativo(payload);
      if (resp.success) {
        notify({
          type: "success",
          content: "Comparativo y cotizaciones registrados correctamente.",
        });
        onSuccess(resp.data, payload, maestros);
      } else {
        notify({
          type: "error",
          content: resp.message || "Error al registrar el comparativo",
        });
      }
    } catch {
      notify({
        type: "error",
        content: "Ocurrió un error al guardar el comparativo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const productosEnUsoIds = useMemo(
    () =>
      productos
        .filter((p) =>
          cotizaciones.some((cot) => {
            return cot.detalles.some(
              (d) =>
                d.id_producto === p.id_producto &&
                !d.no_cotiza &&
                (d.precio_unitario > 0 ||
                  (d.comentario && d.comentario.trim() !== ""))
            );
          }),
        )
        .map((p) => p.id_producto),
    [productos, cotizaciones],
  );

  return {
    productos,
    cotizaciones,
    maestros,
    loading,
    loadingMaestros,
    toggleProductoEnComparador,
    productosEnUsoIds,
    agregarCotizacion,
    eliminarCotizacion,
    eliminarFilaProducto,
    updateCotizacionHeader,
    updateCotizacionDetail,
    toggleCotizacionNoCotiza,
    handleSave,
    wizardAprobacionOpened,
    setWizardAprobacionOpened,
    wizardPayload,
    duplicarFilaProducto,
    updateGlobalLogistica,
    copySource,
    iniciarCopia,
    cancelarCopia,
    pegarCopia,
  };
};
