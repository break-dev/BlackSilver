import { useState, useEffect } from "react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface AprobacionDetalleInput {
  /** id_cotizacion_detalle (modal existente) ó dIdx (wizard) */
  key: number;
  precio_referencia: number;
  habilitado: boolean; // false = no_cotiza
}

/** Shape de estado compartido entre el hook y el Wizard */
export interface AprobacionState {
  selectedEmpresaId: string | null;
  tipoCambio: number | "";
  selectedKeys: number[];
  preciosOC: Record<number, number | "">;
}

// ─── Funciones puras (usables en el Wizard sin violar reglas de hooks) ────────

/** Inicializa el estado de aprobación desde los detalles. */
export function initAprobacionState(
  detalles: AprobacionDetalleInput[],
  initialEmpresaId?: string | null,
  initialTipoCambio?: number | "",
): AprobacionState {
  return {
    selectedEmpresaId: initialEmpresaId ?? null,
    tipoCambio: initialTipoCambio ?? "",
    selectedKeys: detalles.filter((d) => d.habilitado).map((d) => d.key),
    preciosOC: Object.fromEntries(
      detalles.map((d) => [d.key, d.precio_referencia || ""]),
    ),
  };
}

/** Valida el estado y devuelve el primer error encontrado o null. */
export function validateAprobacion(
  state: AprobacionState,
  moneda: string,
): string | null {
  if (!state.selectedEmpresaId)
    return "Debe seleccionar una empresa compradora.";
  if (moneda !== "Soles" && (!state.tipoCambio || state.tipoCambio <= 0))
    return "Debe ingresar un tipo de cambio válido.";
  if (state.selectedKeys.length === 0)
    return "Debe seleccionar al menos un producto.";
  const sinPrecio = state.selectedKeys.filter((k) => !state.preciosOC[k]);
  if (sinPrecio.length > 0)
    return "Todos los productos seleccionados deben tener un precio confirmado.";
  return null;
}

/** Calcula el subtotal de un ítem usando el precio OC confirmado (o el de referencia si no hay). */
export function getSubtotalAprobacion(
  state: AprobacionState,
  key: number,
  cantidad: number,
  precioReferencia: number,
): number {
  return cantidad * Number(state.preciosOC[key] ?? precioReferencia ?? 0);
}

/** Devuelve la variación del precio OC vs la cotización, o null si no cambió. */
export function getVariacionAprobacion(
  state: AprobacionState,
  key: number,
  precioReferencia: number,
): number | null {
  const oc = Number(state.preciosOC[key] ?? 0);
  if (oc === 0 || oc === precioReferencia) return null;
  return oc - precioReferencia;
}

/** Obtiene el tipo de cambio aplicado (1 si es Soles). */
export function getTipoCambioAplicado(
  state: AprobacionState,
  moneda: string,
): number {
  return moneda !== "Soles" ? Number(state.tipoCambio) : 1;
}

// ─── Hook (solo para el modal de cotización individual) ───────────────────────

interface UseAprobacionCotizacionOptions {
  moneda: string;
  detalles: AprobacionDetalleInput[];
  initialEmpresaId?: string | null;
  initialTipoCambio?: number | "";
  /** Pasar `opened` para que el hook resetee el estado al abrir el modal */
  opened: boolean;
}

export function useAprobacionCotizacion({
  moneda,
  detalles,
  initialEmpresaId,
  initialTipoCambio,
  opened,
}: UseAprobacionCotizacionOptions) {
  const [state, setState] = useState<AprobacionState>(() =>
    initAprobacionState(detalles, initialEmpresaId, initialTipoCambio),
  );

  // Resetear estado cuando el modal se abre
  useEffect(() => {
    if (opened) {
      setState(
        initAprobacionState(detalles, initialEmpresaId, initialTipoCambio),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const habilitados = detalles.filter((d) => d.habilitado).map((d) => d.key);
  const allSelected =
    habilitados.length > 0 && state.selectedKeys.length === habilitados.length;
  const indeterminate =
    state.selectedKeys.length > 0 &&
    state.selectedKeys.length < habilitados.length;

  const toggleKey = (key: number) =>
    setState((prev) => ({
      ...prev,
      selectedKeys: prev.selectedKeys.includes(key)
        ? prev.selectedKeys.filter((k) => k !== key)
        : [...prev.selectedKeys, key],
    }));

  const toggleAll = () =>
    setState((prev) => ({
      ...prev,
      selectedKeys: allSelected ? [] : habilitados,
    }));

  const setPrecioOC = (key: number, val: number | "") =>
    setState((prev) => ({
      ...prev,
      preciosOC: { ...prev.preciosOC, [key]: val },
    }));

  const validate = () => validateAprobacion(state, moneda);

  const tipoCambioAplicado = getTipoCambioAplicado(state, moneda);

  const getSubtotal = (key: number, cantidad: number, precioRef: number) =>
    getSubtotalAprobacion(state, key, cantidad, precioRef);

  const getVariacion = (key: number, precioRef: number) =>
    getVariacionAprobacion(state, key, precioRef);

  return {
    state,
    setState,
    allSelected,
    indeterminate,
    habilitados,
    tipoCambioAplicado,
    toggleKey,
    toggleAll,
    setPrecioOC,
    validate,
    getSubtotal,
    getVariacion,
  };
}
