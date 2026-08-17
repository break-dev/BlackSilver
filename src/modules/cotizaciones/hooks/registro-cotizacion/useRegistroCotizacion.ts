import { useCallback } from "react";
import type { DTO_RegistrarComparativo } from "../../service/cotizaciones.requests";
import type { RES_Comparativo } from "../../../../service/responses/cotizaciones/cotizacion";
import { useCotizacionMaestros } from "../shared/useCotizacionMaestros";
import { useCotizacionGrid } from "../shared/useCotizacionGrid";
import { useCotizacionHandlers } from "../shared/useCotizacionHandlers";
import { useCotizacionPersistence } from "./useCotizacionPersistence";
import { Moneda } from "../../../../shared/enums/_generic/moneda";
import type { MaestrosState } from "../shared/utils";

export { type MaestrosState };

export const useRegistroCotizacion = (
  onSuccess: (
    data: RES_Comparativo[],
    payload: DTO_RegistrarComparativo,
    currentMaestros: MaestrosState,
    printTarget?: string,
  ) => void,
  monedaFiltro: Moneda | null = null,
) => {
  const defaultMonedaCotizacion: Moneda = monedaFiltro ?? Moneda.Soles;
  const { maestros, loadingMaestros, agregarProveedorLocal, agregarProductoLocal } = useCotizacionMaestros();
  
  const {
    productos,
    setProductos,
    cotizaciones,
    setCotizaciones,
    toggleProductoEnComparador,
    agregarCotizacion,
    eliminarCotizacion,
    eliminarFilaProducto,
    limpiarComparativo,
  } = useCotizacionGrid(maestros, defaultMonedaCotizacion);

  const {
    updateCotizacionHeader,
    updateCotizacionDetail,
    toggleCotizacionNoCotiza,
    updateGlobalLogistica,
    duplicarFilaProducto,
    copySource,
    iniciarCopia: _iniciarCopia,
    cancelarCopia,
    pegarCopia,
    copiedCotizacion,
    iniciarCopiaCotizacion,
    pegarCotizacion,
    cancelarCopiaCotizacion,
  } = useCotizacionHandlers(setProductos, setCotizaciones, maestros);

  const {
    handleSave,
    loading,
    wizardAprobacionOpened,
    setWizardAprobacionOpened,
    wizardPayload,
    productosEnUsoIds,
  } = useCotizacionPersistence(productos, cotizaciones, maestros, onSuccess);

  // Wrapper para pasar cotizaciones actualizadas al iniciar copia
  const iniciarCopia = useCallback(
    (cotIndex: number, rowIndex: number, id_producto: number) => {
      _iniciarCopia(cotIndex, rowIndex, id_producto, cotizaciones);
    },
    [_iniciarCopia, cotizaciones],
  );

  // Wrapper para pasar cotizaciones al iniciar copia de cotización completa
  const _iniciarCopiaCotizacion = useCallback(
    (sourceIndex: number, type: "all" | "general" | "delivery") => {
      iniciarCopiaCotizacion(sourceIndex, type, cotizaciones);
    },
    [iniciarCopiaCotizacion, cotizaciones],
  );

  return {
    productos,
    cotizaciones,
    maestros,
    agregarProveedorLocal,
    agregarProductoLocal,
    loading,
    loadingMaestros,
    toggleProductoEnComparador,
    productosEnUsoIds,
    agregarCotizacion,
    eliminarCotizacion,
    eliminarFilaProducto,
    limpiarComparativo,
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
    copiedCotizacion,
    iniciarCopiaCotizacion: _iniciarCopiaCotizacion,
    pegarCotizacion,
    cancelarCopiaCotizacion,
  };
};
