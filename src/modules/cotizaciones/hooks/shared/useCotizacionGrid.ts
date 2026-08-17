import { useState, useCallback } from "react";
import type { DTO_ProductoComparativo, DTO_CotizacionRequest } from "../../service/cotizaciones.requests";
import { TipoEntidad } from "../../../../shared/enums/_generic/tipo-entidad";
import { MetodoPago } from "../../../../shared/enums/_generic/metodo-pago";
import { Estado_Cotizacion } from "../../../../shared/enums/cotizacion/cotizacion";
import { Moneda } from "../../../../shared/enums/_generic/moneda";
import { detalleVacio, recalcularTotales, type MaestrosState } from "./utils";

export const useCotizacionGrid = (
  maestros: MaestrosState,
  defaultMonedaCotizacion: Moneda = Moneda.Soles,
) => {
  const [productos, setProductos] = useState<DTO_ProductoComparativo[]>([]);
  const [cotizaciones, setCotizaciones] = useState<DTO_CotizacionRequest[]>([]);

  const toggleProductoEnComparador = useCallback(
    (id_producto: number) => {
      setProductos((prev) => {
        const existe = prev.some((p) => p.id_producto === id_producto);

        if (existe) {
          const tieneDatos = cotizaciones.some((cot) => {
            return cot.detalles.some(
              (d) =>
                d.id_producto === id_producto &&
                ((d.precio_unitario ?? 0) > 0 ||
                  (d.comentario && d.comentario.trim() !== "")),
            );
          });
          if (tieneDatos) return prev;

          const nuevosProds = prev.filter((p) => p.id_producto !== id_producto);
          setCotizaciones((prevCots) =>
            prevCots.map((cot) => {
              const nuevaCot = {
                ...cot,
                detalles: cot.detalles.filter(
                  (d) => d.id_producto !== id_producto,
                ),
              };
              Object.assign(nuevaCot, recalcularTotales(nuevaCot));
              return nuevaCot;
            }),
          );
          return nuevosProds;
        } else {
          const maestro = maestros.catalogo.find(
            (m) => m.id_producto === id_producto,
          );
          const idUnidadBase = maestro?.id_unidad_medida_base || 1;

          const costoBase = maestro?.costo_promedio_base || 0;

          // Solo auto-rellenar precio si TODAS las cotizaciones-columna existentes
          // tienen la misma moneda que el producto. Si difieren, no autocompleta en
          // ninguna (consistencia visual; el usuario tipea manualmente).
          const monedasCot = cotizaciones.map((c) => c.moneda);
          const monedasCoinciden =
            monedasCot.length === 0 ||
            monedasCot.every((m) => m === maestro?.moneda);

          setCotizaciones((prevCots) =>
            prevCots.map((cot) => {
              const nuevoDetalle = detalleVacio(id_producto, idUnidadBase);
              if (monedasCoinciden) {
                nuevoDetalle.precio_unitario = costoBase;
                nuevoDetalle.precio_unitario_base = costoBase;
              }

              const nuevaCot = {
                ...cot,
                detalles: [...cot.detalles, nuevoDetalle],
              };

              Object.assign(nuevaCot, recalcularTotales(nuevaCot));

              return nuevaCot;
            }),
          );
          return [...prev, { id_producto, id_solicitud_detalle: null }];
        }
      });
    },
    [maestros.catalogo, cotizaciones],
  );

  const agregarCotizacion = useCallback(() => {
    setCotizaciones((prev) => {
      const nuevaCot: DTO_CotizacionRequest = {
        id_proveedor: 0,
        tipo_entidad_proveedor: TipoEntidad.Juridica,
        empresas_ids: [],
        moneda: defaultMonedaCotizacion,
        tipo_cambio_venta_referencial: defaultMonedaCotizacion === Moneda.Soles ? 1 : undefined,
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
          const costoBase = maestro?.costo_promedio_base || 0;
          const det = detalleVacio(
            p.id_producto,
            maestro?.id_unidad_medida_base || 1,
          );
          // Solo auto-rellenar si la moneda de la nueva cotización coincide con la del producto.
          if (defaultMonedaCotizacion === maestro?.moneda) {
            det.precio_unitario = costoBase;
            det.precio_unitario_base = costoBase;
          }
          return det;
        }),
      };

      Object.assign(nuevaCot, recalcularTotales(nuevaCot));

      return [...prev, nuevaCot];
    });
  }, [productos, maestros.catalogo, defaultMonedaCotizacion]);

  const eliminarCotizacion = useCallback((index: number) => {
    setCotizaciones((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const eliminarFilaProducto = useCallback((rowIndex: number) => {
    setProductos((prev) => prev.filter((_, i) => i !== rowIndex));
    setCotizaciones((prevCots) =>
      prevCots.map((cot) => ({
        ...cot,
        detalles: cot.detalles.filter((_, i) => i !== rowIndex),
      })),
    );
  }, []);

  const limpiarComparativo = useCallback(() => {
    setProductos([]);
    setCotizaciones([]);
  }, []);

  return {
    productos,
    setProductos,
    cotizaciones,
    setCotizaciones,
    toggleProductoEnComparador,
    agregarCotizacion,
    eliminarCotizacion,
    eliminarFilaProducto,
    limpiarComparativo,
  };
};
