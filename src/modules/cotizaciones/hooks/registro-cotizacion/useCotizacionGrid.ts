import { useState, useCallback } from "react";
import type { DTO_ProductoComparativo, DTO_CotizacionRequest } from "../../service/cotizaciones.requests";
import { TipoEntidad } from "../../../../shared/enums/_generic/tipo-entidad";
import { MetodoPago } from "../../../../shared/enums/_generic/metodo-pago";
import { Estado_Cotizacion } from "../../../../shared/enums/cotizacion/cotizacion";
import { detalleVacio, type MaestrosState } from "./utils";

export const useCotizacionGrid = (maestros: MaestrosState) => {
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

  const agregarCotizacion = useCallback(() => {
    setCotizaciones((prev) => {
      const nuevaCot: DTO_CotizacionRequest = {
        id_proveedor: 0,
        tipo_entidad_proveedor: TipoEntidad.Juridica,
        empresas_ids: [],
        moneda: "Soles",
        tipo_cambio_venta_referencial: 1,
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
