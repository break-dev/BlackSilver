import { useState, useCallback, useEffect, useMemo } from "react";
import type {
  DTO_CotizacionRequest,
  DTO_ProductoComparativo,
  DTO_CotizacionDetalle,
  DTO_RegistrarComparativo,
} from "../service/cotizaciones.requests";
import type {
  RES_MaestroProducto,
  RES_MaestroProveedor,
  RES_MaestroUnidadMedida,
  RES_MaestroEmpresa,
} from "../service/cotizaciones.responses";
import { CotizacionesService } from "../service/cotizaciones.service";
import { useNotify } from "../../../hooks/useNotify";
import { Estado_Cotizacion, Estado_Cotizacion_Detalle } from "../../../shared/enums/cotizacion/cotizacion";
import { MetodoPago } from "../../../shared/enums/_generic/metodo-pago";
import { usePrint } from "../../../hooks/usePrint";
import { OrdenCompraPDF } from "../presentation/orden-compra-pdf";
import type { RES_Cotizacion, RES_CotizacionDetalle } from "../service/cotizaciones.responses";
import React from "react";

export const useRegistroCotizacion = (onSuccess: () => void) => {
  const { notify } = useNotify();
  const { print, prepare } = usePrint();
  const [loading, setLoading] = useState(false);
  const [loadingMaestros, setLoadingMaestros] = useState(true);

  // Estados para maestros
  const [maestros, setMaestros] = useState<{
    proveedores: RES_MaestroProveedor[];
    unidades: RES_MaestroUnidadMedida[];
    catalogo: RES_MaestroProducto[];
    empresas: RES_MaestroEmpresa[];
  }>({
    proveedores: [],
    unidades: [],
    catalogo: [],
    empresas: [],
  });

  const [productos, setProductos] = useState<DTO_ProductoComparativo[]>([]);
  const [cotizaciones, setCotizaciones] = useState<DTO_CotizacionRequest[]>([]);

  // Carga inicial de maestros
  useEffect(() => {
    const cargarMaestros = async () => {
      try {
        setLoadingMaestros(true);
        const [resProv, resUni, resProd, resEmp] = await Promise.all([
          CotizacionesService.get_proveedores_maestro(),
          CotizacionesService.get_unidades_medida_maestro(),
          CotizacionesService.get_productos_maestro(),
          CotizacionesService.get_empresas_maestro()
        ]);

        setMaestros({
          proveedores: resProv.success ? resProv.data : [],
          unidades: resUni.success ? resUni.data : [],
          catalogo: resProd.success ? resProd.data : [],
          empresas: resEmp.success ? resEmp.data : [],
        });
      } catch (error) {
        console.error("Error al cargar maestros en hook", error);
      } finally {
        setLoadingMaestros(false);
      }
    };
    cargarMaestros();
  }, []);

  // Paso 1: Añadir/Quitar productos base del comparativo (Toggle)
  const toggleProductoEnComparador = useCallback(
    (id_producto: number) => {
      setProductos((prev) => {
        const existe = prev.some((p) => p.id_producto === id_producto);

        if (existe) {
          // Antes de quitar, verificamos si tiene datos en las cotizaciones
          const tieneDatos = cotizaciones.some((cot) => {
            const det = cot.detalles.find((d) => d.id_producto === id_producto);
            return (
              det &&
              (det.precio_unitario > 0 ||
                (det.comentario && det.comentario.trim() !== ""))
            );
          });

          if (tieneDatos) return prev; // No permitimos quitarlo si tiene datos

          // Si no tiene datos, lo quitamos de la lista base
          const nuevosProds = prev.filter((p) => p.id_producto !== id_producto);

          // Y lo quitamos de los detalles de todas las cotizaciones
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
          // Si no existe, lo agregamos (Lógica original)
          const nuevoProd: DTO_ProductoComparativo = {
            id_producto,
            id_solicitud_detalle: null,
          };

          const maestro = maestros.catalogo.find(
            (m) => m.id_producto === id_producto,
          );
          const idUnidadBase = maestro?.id_unidad_medida_base || 1;

          setCotizaciones((prevCots) =>
            prevCots.map((cot) => ({
              ...cot,
              detalles: [
                ...cot.detalles,
                {
                  id_producto,
                  id_unidad_medida: idUnidadBase,
                  cantidad: 1,
                  contenido_por_presentacion: 1,
                  cantidad_base: 1,
                  precio_unitario: 0,
                  precio_unitario_base: 0,
                  no_cotiza: false,
                  comentario: null,
                  estado: null as import("../../../shared/enums/cotizacion/cotizacion").Estado_Cotizacion_Detalle | null,
                },
              ],
            })),
          );

          return [...prev, nuevoProd];
        }
      });
    },
    [maestros.catalogo, cotizaciones],
  );

  // Paso 2: Añadir una nueva columna (oferta) al comparativo
  const agregarCotizacion = useCallback(() => {
    setCotizaciones((prev) => {
      const nuevaCot: DTO_CotizacionRequest = {
        id_proveedor: 0,
        empresas_ids: [],
        moneda: "Soles",
        metodo_pago: MetodoPago.Contado,
        fecha_vencimiento_pago: null, // Ahora será Date | null en el estado del hook
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
          return {
            id_producto: p.id_producto,
            id_unidad_medida: maestro?.id_unidad_medida_base || 1,
            cantidad: 1,
            contenido_por_presentacion: 1,
            cantidad_base: 1,
            precio_unitario: 0,
            precio_unitario_base: 0,
            no_cotiza: false,
            comentario: null,
            estado: null as import("../../../shared/enums/cotizacion/cotizacion").Estado_Cotizacion_Detalle | null,
          };
        }),
      };
      return [...prev, nuevaCot];
    });
  }, [productos, maestros.catalogo]);

  const eliminarCotizacion = useCallback((index: number) => {
    setCotizaciones((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Actualización de cabeceras (Proveedor, Moneda, etc)
  const updateCotizacionHeader = useCallback(
    <K extends keyof DTO_CotizacionRequest>(
      index: number,
      field: K,
      value: DTO_CotizacionRequest[K],
    ) => {
      setCotizaciones((prev) => {
        const p = [...prev];
        const target = { ...p[index], [field]: value };

        if (
          field === "incluye_igv" ||
          field === "porcentaje_igv" ||
          field === "id_proveedor"
        ) {
          const sumDetalles = target.detalles.reduce((acc, d) => {
            if (d.no_cotiza) return acc;
            return acc + d.cantidad * d.precio_unitario;
          }, 0);
          const factor = 1 + target.porcentaje_igv / 100;

          if (target.incluye_igv) {
            target.total_despues_igv = sumDetalles;
            target.total_antes_igv = sumDetalles / factor;
            target.monto_igv = sumDetalles - target.total_antes_igv;
          } else {
            target.total_antes_igv = sumDetalles;
            target.monto_igv = sumDetalles * (target.porcentaje_igv / 100);
            target.total_despues_igv = sumDetalles + target.monto_igv;
          }
        }

        if ((field as string) === "estado") {
          const isAprobado = value === Estado_Cotizacion.Aprobada;
          target.detalles = target.detalles.map(d => {
            if (d.no_cotiza) return d;
            return {
              ...d,
              estado: isAprobado ? Estado_Cotizacion_Detalle.Aprobado : null
            };
          });
          
          // Validación: No puede pasar a Aprobada si no tiene productos hábiles
          const hasHabiles = target.detalles.some(d => !d.no_cotiza);
          if (isAprobado && !hasHabiles) {
            target.estado = Estado_Cotizacion.Generada;
          }
        }

        p[index] = target;
        return p;
      });
    },
    [],
  );

  // Actualización de detalles (Precios, cantidades por proveedor)
  const updateCotizacionDetail = useCallback(
    <K extends keyof DTO_CotizacionDetalle>(
      cotIndex: number,
      prodId: number,
      field: K,
      value: DTO_CotizacionDetalle[K],
    ) => {
      setCotizaciones((prev) => {
        const p = [...prev];
        const cot = { ...p[cotIndex] };
        const detalles = cot.detalles.map((d) => {
          if (d.id_producto !== prodId) return d;

          const updatedDet = { ...d, [field]: value };

          // Lógica de reset si la unidad coincide con la base
          if (field === "id_unidad_medida") {
            const maestro = maestros.catalogo.find(
              (m) => m.id_producto === prodId,
            );
            if (maestro && Number(value) === maestro.id_unidad_medida_base) {
              updatedDet.contenido_por_presentacion = 1;
            }
          }

          updatedDet.cantidad_base =
            updatedDet.cantidad * updatedDet.contenido_por_presentacion;
          const pBase =
            updatedDet.contenido_por_presentacion > 0
              ? updatedDet.precio_unitario /
                updatedDet.contenido_por_presentacion
              : 0;
          updatedDet.precio_unitario_base = Number(pBase.toFixed(2));

          return updatedDet;
        });

        cot.detalles = detalles;

        if ((field as string) === "estado") {
          const updatedDets = [...detalles];
          const actualItem = updatedDets.find(d => d.id_producto === prodId);
          if (actualItem) {
             actualItem.estado = value as Estado_Cotizacion_Detalle;
          }
          
          const anyAprobado = updatedDets.some(d => d.estado === Estado_Cotizacion_Detalle.Aprobado);
          cot.estado = anyAprobado ? Estado_Cotizacion.Aprobada : Estado_Cotizacion.Generada;
          
          if (!anyAprobado) {
             // Si desmarcó el último, devolvemos todo a su origen sin estado
             cot.detalles = updatedDets.map(d => ({ ...d, estado: null }));
          } else {
             // Si hay al menos un aprobado, el resto pasa a rechazado estrictamente (si no estan "no cotiza")
             cot.detalles = updatedDets.map(d => ({ ...d, estado: d.no_cotiza ? null : (d.estado === Estado_Cotizacion_Detalle.Aprobado ? Estado_Cotizacion_Detalle.Aprobado : Estado_Cotizacion_Detalle.Rechazado) }));
          }
        }

        const sumDetalles = cot.detalles.reduce((acc, d) => {
          if (d.no_cotiza) return acc;
          return acc + d.cantidad * d.precio_unitario;
        }, 0);
        const factor = 1 + cot.porcentaje_igv / 100;

        if (cot.incluye_igv) {
          cot.total_despues_igv = sumDetalles;
          cot.total_antes_igv = sumDetalles / factor;
          cot.monto_igv = sumDetalles - cot.total_antes_igv;
        } else {
          cot.total_antes_igv = sumDetalles;
          cot.monto_igv = sumDetalles * (cot.porcentaje_igv / 100);
          cot.total_despues_igv = sumDetalles + cot.monto_igv;
        }

        p[cotIndex] = cot;
        return p;
      });
    },
    [maestros.catalogo],
  );

  const toggleCotizacionNoCotiza = useCallback(
    (cotIndex: number, prodId: number) => {
      setCotizaciones((prev) => {
        const p = [...prev];
        const cot = { ...p[cotIndex] };
        const detalles = cot.detalles.map((d) => {
          if (d.id_producto !== prodId) return d;
          return { 
             ...d, 
             no_cotiza: !d.no_cotiza,
             estado: !d.no_cotiza ? null : d.estado // Si se vuelve "no_cotiza", le quitamos el estado
          };
        });

        cot.detalles = detalles;

        // Auto-check si al anularlo era el único aprobado
        const anyAprobado = cot.detalles.some(d => d.estado === Estado_Cotizacion_Detalle.Aprobado);
        cot.estado = anyAprobado ? Estado_Cotizacion.Aprobada : Estado_Cotizacion.Generada;
        if (!anyAprobado) {
           cot.detalles = cot.detalles.map(d => ({ ...d, estado: null }));
        }

        // Recalcular totales al cambiar estado "no cotiza"
        const sumDetalles = detalles.reduce((acc, d) => {
          if (d.no_cotiza) return acc;
          return acc + d.cantidad * d.precio_unitario;
        }, 0);
        const factor = 1 + cot.porcentaje_igv / 100;

        if (cot.incluye_igv) {
          cot.total_despues_igv = sumDetalles;
          cot.total_antes_igv = sumDetalles / factor;
          cot.monto_igv = sumDetalles - cot.total_antes_igv;
        } else {
          cot.total_antes_igv = sumDetalles;
          cot.monto_igv = sumDetalles * (cot.porcentaje_igv / 100);
          cot.total_despues_igv = sumDetalles + cot.monto_igv;
        }

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
        content: "Todas las cotizaciones deben tener al menos una empresa compradora seleccionada.",
      });
      return;
    }

    // 1. Validar Fechas de Vencimiento para Créditos
    const cotsSinFecha = cotizaciones.some(
      (c) => c.metodo_pago === MetodoPago.Credito && !c.fecha_vencimiento_pago,
    );
    if (cotsSinFecha) {
      notify({
        type: "info",
        content:
          "Si el método es crédito, debe asignar una fecha de vencimiento.",
      });
      return;
    }

    // 2. Validar que cada proveedor tenga al menos un producto "Habilitado"
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

    // 3. Validar que los productos habilitados tengan precio > 0
    const productosSinPrecio = cotizaciones.some((c) =>
      c.detalles.some((d) => !d.no_cotiza && d.precio_unitario <= 0),
    );
    if (productosSinPrecio) {
      notify({
        type: "info",
        content:
          "Todos los productos habilitados deben tener un precio mayor a 0.",
      });
      return;
    }

    // 4. Previsión de Impresión (Para evitar popup blocker)
    let printerWin: Window | null = null;
    const tieneAprobadas = cotizaciones.some(c => c.estado === Estado_Cotizacion.Aprobada);
    
    if (tieneAprobadas) {
      printerWin = prepare("OrdenCompraPDF");
    }

    setLoading(true);
    try {
      const payload: DTO_RegistrarComparativo = {
        productos: productos,
        cotizaciones: cotizaciones.map((c) => {
          // Conversión robusta a YYYY-MM-DD para evitar rechazos de la base de datos (Columna DATE)
          let fechaStr = null;
          if (
            c.metodo_pago === MetodoPago.Credito &&
            c.fecha_vencimiento_pago
          ) {
            const d = new Date(c.fecha_vencimiento_pago as unknown as string);
            if (!isNaN(d.getTime())) {
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, "0");
              const day = String(d.getDate()).padStart(2, "0");
              fechaStr = `${year}-${month}-${day}`;
            }
          }

          return {
            ...c,
            fecha_vencimiento_pago: fechaStr,
            // AQUÍ FILTRAMOS LO QUE NO SE COTIZA Y REDONDEAMOS DECIMALES
            detalles: c.detalles
              .filter((d) => !d.no_cotiza)
              .map((d) => ({
                ...d,
                precio_unitario_base: Number(d.precio_unitario_base.toFixed(2)),
                cantidad_base: Number(d.cantidad_base.toFixed(2)),
              })),
            total_antes_igv: Number(c.total_antes_igv.toFixed(2)),
            monto_igv: Number(c.monto_igv.toFixed(2)),
            total_despues_igv: Number(c.total_despues_igv.toFixed(2)),
          };
        }),
      };

      const resp = await CotizacionesService.registrar_comparativo(payload);

      if (resp.success) {
        // 4. Imprimir reportes de los aprobados si existen
          if (resp.data?.ids_aprobadas && resp.data.ids_aprobadas.length > 0) {
            resp.data.ids_aprobadas.forEach((aprobada: { id: number; correlativo: string }) => {
              // Vamos a intentar encontrar la cotización en el estado local que fue marcada como Aprobada
              const cotLocal = cotizaciones.find(c => c.estado === Estado_Cotizacion.Aprobada);
              if (cotLocal && resp.data) {
                const prov = maestros.proveedores.find(p => p.id_proveedor === cotLocal.id_proveedor);
                
                const resCot: RES_Cotizacion = {
                  id: aprobada.id,
                  id_comparativo: resp.data.id_comparativo,
                  id_proveedor: cotLocal.id_proveedor,
                  proveedor_nombre: prov?.razon_social || "Desconocido",
                  moneda: cotLocal.moneda,
                  correlativo: aprobada.correlativo,
                  numero_correlativo: 0,
                  metodo_pago: cotLocal.metodo_pago,
                  fecha_vencimiento_pago: (cotLocal.fecha_vencimiento_pago as string | null) || null,
                  total_antes_igv: cotLocal.total_antes_igv,
                  incluye_igv: cotLocal.incluye_igv,
                  porcentaje_igv: cotLocal.porcentaje_igv,
                  monto_igv: cotLocal.monto_igv,
                  total_despues_igv: cotLocal.total_despues_igv,
                  observacion: cotLocal.observacion || null,
                  evidencias: null,
                  fecha_hora_cotizacion: new Date().toISOString(),
                  comparativo_fecha: new Date().toISOString(),
                  estado: Estado_Cotizacion.Aprobada,
                  created_at: new Date().toISOString()
                };

                const resDetalles: RES_CotizacionDetalle[] = cotLocal.detalles
                  .filter(d => !d.no_cotiza)
                  .map((d, idx) => {
                    const prod = maestros.catalogo.find(p => p.id_producto === d.id_producto);
                    const uni = maestros.unidades.find(u => u.id_unidad_medida === d.id_unidad_medida);
                    return {
                      id: idx,
                      id_cotizacion: aprobada.id,
                      id_comparativo_detalle: 0,
                      id_unidad_medida: d.id_unidad_medida,
                      producto_nombre: prod?.nombre || "Producto",
                      unidad_medida_nombre: uni?.nombre || "UM",
                      unidad_medida_abv: uni?.abreviatura || "UM",
                      cantidad: d.cantidad,
                      contenido_por_presentacion: d.contenido_por_presentacion,
                      cantidad_base: d.cantidad_base,
                      precio_unitario: d.precio_unitario,
                      precio_unitario_base: d.precio_unitario_base,
                      comentario: d.comentario || null,
                      no_cotiza: 0,
                      unidad_medida_base_abv: prod?.unidad_medida_abreviatura || "UND"
                    };
                  });

              print(React.createElement(OrdenCompraPDF, { 
                cotizacion: resCot, 
                detalles: resDetalles 
              }), {
                documentTitle: `Orden de Compra - ${aprobada.correlativo}`,
                target: "OrdenCompraPDF"
              });
            }
          });
        }

        onSuccess();
      } else {
        notify({ type: "error", content: resp.message });
        printerWin?.close();
      }
    } catch {
      notify({
        type: "error",
        content: "Ocurrió un error al guardar el comparativo.",
      });
      printerWin?.close();
    } finally {
      setLoading(false);
    }
  };

  const productosEnUsoIds = useMemo(() => {
    return productos
      .filter((p) => {
        return cotizaciones.some((cot) => {
          const det = cot.detalles.find((d) => d.id_producto === p.id_producto);
          // Si no cotiza, no se cuenta como "en uso" (se puede quitar del comparativo)
          return (
            det &&
            !det.no_cotiza &&
            (det.precio_unitario > 0 ||
              (det.comentario && det.comentario.trim() !== ""))
          );
        });
      })
      .map((p) => p.id_producto);
  }, [productos, cotizaciones]);

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
    updateCotizacionHeader,
    updateCotizacionDetail,
    toggleCotizacionNoCotiza,
    handleSave,
  };
};
