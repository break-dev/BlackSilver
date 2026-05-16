import { useState, useCallback } from "react";
import type {
  DTO_CotizacionRequest,
  DTO_CotizacionDetalle,
  DTO_ProductoComparativo,
} from "../../service/cotizaciones.requests";
import {
  Estado_Cotizacion,
  Estado_Cotizacion_Detalle,
} from "../../../../shared/enums/cotizacion/cotizacion";
import { TipoDespachoCompra } from "../../../../shared/enums/_generic/tipo-despacho-compra";
import { Periodo } from "../../../../shared/enums/_generic/periodo";
import { TipoBien } from "../../../../shared/enums/_generic/tipo-bien";
import {
  recalcularTotales,
  DIAS_POR_PERIODO,
  type MaestrosState,
} from "./utils";
import { useNotify } from "../../../../hooks/useNotify";

export const useCotizacionHandlers = (
  setProductos: React.Dispatch<React.SetStateAction<DTO_ProductoComparativo[]>>,
  setCotizaciones: React.Dispatch<
    React.SetStateAction<DTO_CotizacionRequest[]>
  >,
  maestros: MaestrosState,
) => {
  const { notify } = useNotify();

  const [copySource, setCopySource] = useState<{
    cotIndex: number;
    rowIndex: number;
    id_producto: number;
    data: Partial<DTO_CotizacionDetalle>;
  } | null>(null);

  const updateCotizacionHeader = useCallback(
    <K extends keyof DTO_CotizacionRequest>(
      index: number,
      field: K,
      value: DTO_CotizacionRequest[K],
    ) => {
      setCotizaciones((prev) => {
        const p = [...prev];
        const target = { ...p[index], [field]: value };

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

        if ((field as string) === "id_proveedor") {
          const provId = Number(value);
          const prov = maestros.proveedores.find(
            (p) => p.id_proveedor === provId,
          );
          const nuevaDireccion = prov?.direccion || "";

          target.detalles = target.detalles.map((d) => {
            if (d.tipo_despacho === TipoDespachoCompra.Recojo) {
              return { ...d, lugar_recojo: nuevaDireccion || null };
            }
            return d;
          });
        }

        p[index] = target;
        return p;
      });
    },
    [setCotizaciones, maestros.proveedores],
  );

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

        if (field === "id_unidad_medida") {
          const maestro = maestros.catalogo.find(
            (m) => m.id_producto === prodId,
          );
          if (maestro) {
            if (Number(value) === maestro.id_unidad_medida_base) {
              upd.contenido_por_presentacion = 1;
            }

            // Sugerir precio si está vacío, es 0 o si el precio base actual coincide con el costo promedio (es sugerido)
            const esSugerido =
              !upd.precio_unitario ||
              upd.precio_unitario === 0 ||
              Math.abs(
                (upd.precio_unitario_base || 0) - maestro.costo_promedio_base,
              ) < 0.01;

            if (esSugerido) {
              upd.precio_unitario = Number(
                (
                  maestro.costo_promedio_base * upd.contenido_por_presentacion
                ).toFixed(2),
              );
            }
          }
        }

        if (field === "contenido_por_presentacion") {
          const maestro = maestros.catalogo.find(
            (m) => m.id_producto === prodId,
          );

          if (maestro) {
            // Recalcular precio sugerido si es un valor sugerido (coincide con el base) o si es 0
            const esSugerido =
              !upd.precio_unitario ||
              upd.precio_unitario === 0 ||
              Math.abs(
                (upd.precio_unitario_base || 0) - maestro.costo_promedio_base,
              ) < 0.01;

            if (esSugerido) {
              upd.precio_unitario = Number(
                (maestro.costo_promedio_base * Number(value)).toFixed(2),
              );
            }
          }
        }

        if (field === "tiempo_entrega_periodo" || field === "tiempo_entrega") {
          upd.tiempo_entrega_dias =
            upd.tiempo_entrega *
            (DIAS_POR_PERIODO[upd.tiempo_entrega_periodo] ?? 1);
        }

        if (field === "tipo_despacho") {
          if (value !== TipoDespachoCompra.Recojo) {
            upd.lugar_recojo = null;
          } else {
            const prov = maestros.proveedores.find(
              (p) => p.id_proveedor === cot.id_proveedor,
            );
            upd.lugar_recojo = prov?.direccion || null;
          }
        }

        upd.cantidad_base = upd.cantidad * upd.contenido_por_presentacion;
        upd.precio_unitario_base =
          upd.contenido_por_presentacion > 0
            ? Number(
                (
                  (upd.precio_unitario || 0) / upd.contenido_por_presentacion
                ).toFixed(4), // Usamos 4 decimales para mayor precisión en la base
              )
            : 0;

        detalles[rowIndex] = upd;
        cot.detalles = detalles;

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
    [setCotizaciones, maestros.catalogo, maestros.proveedores],
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
    [setCotizaciones],
  );

  const updateGlobalLogistica = useCallback(
    (
      cotIndex: number,
      data: {
        id_almacen_recepcionista: number | null;
        id_mina_destino?: number | null;
        tipo_despacho: TipoDespachoCompra;
        lugar_recojo?: string;
        tiempo_entrega: number;
        tiempo_entrega_periodo: Periodo;
      },
    ) => {
      setCotizaciones((prev) => {
        const p = [...prev];
        const cot = { ...p[cotIndex] };
        const dias =
          data.tiempo_entrega *
          (DIAS_POR_PERIODO[data.tiempo_entrega_periodo] ?? 1);

        cot.detalles = cot.detalles.map((d) => {
          const maestro = maestros.catalogo.find(
            (m) => m.id_producto === d.id_producto,
          );
          const esActivo = maestro?.tipo_bien === TipoBien.ActivoFijo;

          // Si se manda una mina global, se aplica a activos y se limpia su almacen.
          // Si no, se aplica el almacen global y se limpia su mina.
          const finalMina = esActivo ? (data.id_mina_destino ?? null) : null;
          const finalAlmacen = finalMina ? null : data.id_almacen_recepcionista;

          return {
            ...d,
            id_almacen_recepcionista: finalAlmacen,
            id_mina_destino: finalMina,
            tipo_despacho: data.tipo_despacho,
            tiempo_entrega: data.tiempo_entrega,
            tiempo_entrega_periodo: data.tiempo_entrega_periodo,
            tiempo_entrega_dias: dias,
            lugar_recojo:
              data.tipo_despacho === TipoDespachoCompra.Recojo
                ? data.lugar_recojo !== undefined
                  ? data.lugar_recojo
                  : d.lugar_recojo
                : null,
          };
        });

        p[cotIndex] = cot;
        return p;
      });
    },
    [setCotizaciones, maestros.catalogo],
  );

  const duplicarFilaProducto = useCallback(
    (rowIndex: number) => {
      setProductos((prev) => {
        const p = [...prev];
        p.splice(rowIndex + 1, 0, { ...p[rowIndex] });
        return p;
      });
      setCotizaciones((prevCots) =>
        prevCots.map((cot) => {
          const c = { ...cot };
          const detalles = [...c.detalles];
          const clone = {
            ...detalles[rowIndex],
            estado: Estado_Cotizacion_Detalle.Pendiente,
          };
          detalles.splice(rowIndex + 1, 0, clone);
          c.detalles = detalles;
          return c;
        }),
      );
    },
    [setProductos, setCotizaciones],
  );

  const iniciarCopia = useCallback(
    (
      cotIndex: number,
      rowIndex: number,
      id_producto: number,
      cotizaciones: DTO_CotizacionRequest[],
    ) => {
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
          id_mina_destino: source.id_mina_destino,
          tipo_despacho: source.tipo_despacho,
          tiempo_entrega: source.tiempo_entrega,
          tiempo_entrega_periodo: source.tiempo_entrega_periodo,
          tiempo_entrega_dias: source.tiempo_entrega_dias,
          lugar_recojo: source.lugar_recojo,
        },
      });
    },
    [],
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

      setCopySource(null);
      notify({ type: "success", content: "Datos copiados con éxito." });
    },
    [copySource, notify, setCotizaciones],
  );

  return {
    updateCotizacionHeader,
    updateCotizacionDetail,
    toggleCotizacionNoCotiza,
    updateGlobalLogistica,
    duplicarFilaProducto,
    copySource,
    iniciarCopia,
    cancelarCopia,
    pegarCopia,
  };
};
