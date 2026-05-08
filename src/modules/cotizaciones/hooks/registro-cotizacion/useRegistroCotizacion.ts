import { useCallback } from "react";
import type { DTO_RegistrarComparativo } from "../../service/cotizaciones.requests";
import type { RES_Comparativo } from "../../../../service/responses/cotizaciones/cotizacion";
import { useCotizacionMaestros } from "./useCotizacionMaestros";
import { useCotizacionGrid } from "./useCotizacionGrid";
import { useCotizacionHandlers } from "./useCotizacionHandlers";
import { useCotizacionPersistence } from "./useCotizacionPersistence";
import type { MaestrosState } from "./utils";

export { type MaestrosState };

export const useRegistroCotizacion = (
  onSuccess: (
    data: RES_Comparativo[],
    payload: DTO_RegistrarComparativo,
    currentMaestros: MaestrosState,
    printTarget?: string,
  ) => void,
) => {
  const { maestros, loadingMaestros } = useCotizacionMaestros();
  
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
  } = useCotizacionGrid(maestros);

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
  };
};
