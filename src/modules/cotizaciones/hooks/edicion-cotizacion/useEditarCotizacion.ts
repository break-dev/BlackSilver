import { useState, useCallback } from "react";
import { useCotizacionMaestros } from "../shared/useCotizacionMaestros";
import { useCotizacionHandlers } from "../shared/useCotizacionHandlers";
import { CotizacionesService } from "../../service/cotizaciones.service";
import { useNotify } from "../../../../hooks/useNotify";
import type {
  RES_Cotizacion,
  RES_Comparativo,
} from "../../../../service/responses/cotizaciones/cotizacion";
import type {
  DTO_ActualizarCotizacion,
  DTO_ProductoComparativo,
  DTO_CotizacionRequest,
} from "../../service/cotizaciones.requests";
import { MetodoPago } from "../../../../shared/enums/_generic/metodo-pago";
import { TipoDespachoCompra } from "../../../../shared/enums/_generic/tipo-despacho-compra";
import { TipoEntidad } from "../../../../shared/enums/_generic/tipo-entidad";
import {
  Estado_Cotizacion,
  Estado_Cotizacion_Detalle,
} from "../../../../shared/enums/cotizacion/cotizacion";
import { Periodo } from "../../../../shared/enums/_generic/periodo";

export const useEditarCotizacion = (
  cotizacionInicial: RES_Cotizacion,
  onSuccess: (data: RES_Comparativo[]) => void,
) => {
  const { notify } = useNotify();
  const { maestros, loadingMaestros, agregarProveedorLocal } =
    useCotizacionMaestros();
  const [loading, setLoading] = useState(false);

  // Mapear RES_Cotizacion a DTO_CotizacionRequest para el grid
  const [cotizaciones, setCotizaciones] = useState<DTO_CotizacionRequest[]>(
    () => [
      {
        id_proveedor: cotizacionInicial.id_proveedor,
        tipo_entidad_proveedor:
          cotizacionInicial.tipo_entidad_proveedor as TipoEntidad,
        empresas_ids: cotizacionInicial.empresas.map((e) => e.id_empresa),
        moneda: cotizacionInicial.moneda,
        tipo_cambio_venta_referencial: Number(
          cotizacionInicial.tipo_cambio_venta_referencial,
        ),
        metodo_pago: cotizacionInicial.metodo_pago as MetodoPago,
        fecha_vencimiento_pago: cotizacionInicial.fecha_vencimiento_pago,
        costo_flete: Number(cotizacionInicial.costo_flete),
        otros_gastos: Number(cotizacionInicial.otros_gastos),
        total_antes_igv: Number(cotizacionInicial.total_antes_igv),
        incluye_igv: Boolean(cotizacionInicial.incluye_igv),
        porcentaje_igv: Number(cotizacionInicial.porcentaje_igv),
        monto_igv: Number(cotizacionInicial.monto_igv),
        total_despues_igv: Number(cotizacionInicial.total_despues_igv),
        observacion: cotizacionInicial.observacion,
        estado: cotizacionInicial.estado as Estado_Cotizacion,
        detalles: cotizacionInicial.detalles.map((d) => ({
          id_cotizacion_detalle: d.id_cotizacion_detalle,
          id_producto: d.id_producto,
          id_unidad_medida: d.id_unidad_medida_ctz,
          id_almacen_recepcionista: d.id_almacen_recepcionista,
          id_mina_destino: d.id_mina_destino,
          tipo_despacho: d.tipo_despacho as TipoDespachoCompra,
          lugar_recojo: d.lugar_recojo,
          tiempo_entrega: d.tiempo_entrega,
          tiempo_entrega_periodo: d.tiempo_entrega_periodo as Periodo,
          tiempo_entrega_dias: d.tiempo_entrega_dias,
          cantidad: Number(d.cantidad),
          contenido_por_presentacion: Number(d.contenido_por_presentacion),
          cantidad_base: Number(d.cantidad_base),
          precio_unitario: Number(d.precio_unitario),
          precio_unitario_base: Number(d.precio_unitario_base),
          comentario: d.comentario,
          no_cotiza: false,
          estado: d.estado as Estado_Cotizacion_Detalle,
        })),
      },
    ],
  );

  // Los productos vienen de la cotización pero son fijos
  const [productos, setProductos] = useState<DTO_ProductoComparativo[]>(() =>
    cotizacionInicial.detalles.map((d) => ({
      id_producto: d.id_producto,
      id_solicitud_detalle: null,
    })),
  );

  const {
    updateCotizacionHeader,
    updateCotizacionDetail,
    toggleCotizacionNoCotiza,
    updateGlobalLogistica,
    copySource,
    iniciarCopia: _iniciarCopia,
    cancelarCopia,
    pegarCopia,
    copiedCotizacion,
    iniciarCopiaCotizacion,
    pegarCotizacion,
    cancelarCopiaCotizacion,
  } = useCotizacionHandlers(setProductos, setCotizaciones, maestros);

  const iniciarCopia = useCallback(
    (cotIndex: number, rowIndex: number, id_producto: number) => {
      _iniciarCopia(cotIndex, rowIndex, id_producto, cotizaciones);
    },
    [_iniciarCopia, cotizaciones],
  );

  const _iniciarCopiaCotizacion = useCallback(
    (sourceIndex: number, type: "all" | "general" | "delivery") => {
      iniciarCopiaCotizacion(sourceIndex, type, cotizaciones);
    },
    [iniciarCopiaCotizacion, cotizaciones],
  );

  const handleSave = async () => {
    const cot = cotizaciones[0];

    // Validaciones básicas (mismas que en registro)
    if (cot.id_proveedor === 0) {
      notify({ type: "info", content: "Debe seleccionar un proveedor." });
      return;
    }
    if (cot.empresas_ids.length === 0) {
      notify({
        type: "info",
        content: "Debe seleccionar al menos una empresa compradora.",
      });
      return;
    }

    const payload: DTO_ActualizarCotizacion = {
      ...cot,
      fecha_vencimiento_pago:
        cot.metodo_pago === MetodoPago.Credito
          ? cot.fecha_vencimiento_pago
          : null,
      detalles: cot.detalles.map((d) => ({
        ...d,
        id_cotizacion_detalle: (
          d as DTO_ActualizarCotizacion["detalles"][number]
        ).id_cotizacion_detalle, // Aseguramos que pasamos el ID para el update
      })),
    };

    setLoading(true);
    try {
      const resp = await CotizacionesService.actualizar_cotizacion(
        cotizacionInicial.id_cotizacion,
        payload,
      );
      if (resp.success) {
        notify({
          type: "success",
          content: "Cotización actualizada correctamente.",
        });
        onSuccess(resp.data);
      } else {
        notify({
          type: "error",
          content: resp.message || "Error al actualizar",
        });
      }
    } catch {
      notify({
        type: "error",
        content: "Error de red al actualizar la cotización.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Maestros precargados para carga optimista (mostrar nombres aunque la API no haya terminado)
  const maestrosPreCargados = {
    ...maestros,
    proveedores:
      maestros.proveedores.length > 0
        ? maestros.proveedores
        : [
            {
              id_proveedor: cotizacionInicial.id_proveedor,
              razon_social: cotizacionInicial.proveedor,
              direccion: null,
              ruc:
                cotizacionInicial.tipo_entidad_proveedor ===
                TipoEntidad.Juridica
                  ? cotizacionInicial.documento_proveedor
                  : null,
              dni:
                cotizacionInicial.tipo_entidad_proveedor === TipoEntidad.Natural
                  ? cotizacionInicial.documento_proveedor
                  : null,
              tipo_entidad:
                (cotizacionInicial.tipo_entidad_proveedor as TipoEntidad) ||
                TipoEntidad.Juridica,
              para_mantenimiento: false,
              para_transporte: false,
            },
          ],
    empresas:
      maestros.empresas.length > 0
        ? maestros.empresas
        : cotizacionInicial.empresas.map((e) => ({
            id_empresa: e.id_empresa,
            ruc: "",
            razon_social: e.razon_social,
            url_logo: null,
          })),
    unidades:
      maestros.unidades.length > 0
        ? maestros.unidades
        : Array.from(
            new Map(
              cotizacionInicial.detalles.map((d) => [
                d.id_unidad_medida_ctz,
                {
                  id_unidad_medida: d.id_unidad_medida_ctz,
                  nombre: d.unidad_medida_ctz,
                  abreviatura: d.unidad_medida_ctz_abv,
                },
              ]),
            ).values(),
          ),
    almacenes:
      maestros.almacenes.length > 0
        ? maestros.almacenes
        : Array.from(
            new Map(
              cotizacionInicial.detalles
                .filter((d) => d.id_almacen_recepcionista)
                .map((d) => [
                  d.id_almacen_recepcionista,
                  {
                    id_almacen: d.id_almacen_recepcionista!,
                    nombre: d.almacen_recepcionista!,
                    es_principal: d.para_un_almacen_principal ? 1 : 0,
                  },
                ]),
            ).values(),
          ),
    minas:
      maestros.minas.length > 0
        ? maestros.minas
        : Array.from(
            new Map(
              cotizacionInicial.detalles
                .filter((d) => d.id_mina_destino)
                .map((d) => [
                  d.id_mina_destino,
                  {
                    id_mina: d.id_mina_destino!,
                    nombre: d.mina_destino!,
                    id_concesion: 0,
                    concesion: "Desconocida",
                  },
                ]),
            ).values(),
          ),
  };

  return {
    productos,
    cotizaciones,
    maestros: maestrosPreCargados,
    agregarProveedorLocal,
    loading,
    loadingMaestros,
    updateCotizacionHeader,
    updateCotizacionDetail,
    toggleCotizacionNoCotiza,
    updateGlobalLogistica,
    handleSave,
    copySource,
    iniciarCopia,
    cancelarCopia,
    pegarCopia,
    copiedCotizacion,
    iniciarCopiaCotizacion: _iniciarCopiaCotizacion,
    pegarCotizacion,
    cancelarCopiaCotizacion,
  };
};
