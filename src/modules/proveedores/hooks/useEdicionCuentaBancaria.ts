import { useState, useCallback } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { ProveedoresService } from "../service/proveedores.service";
import { Schema_EditarCuentaBancaria } from "../service/proveedores.requests";
import { Moneda } from "../../../shared/enums/_generic/moneda";
import type { RES_Banco } from "../../../service/responses/banco";
import type { CuentaBancariaResponse } from "../service/proveedores.responses";
import { AuxService } from "../../../service/auxiliar.service";

interface UseEdicionCuentaBancariaProps {
  onSuccess?: (cuentaActualizada: CuentaBancariaResponse) => void;
  onClose: () => void;
  /**
   * Si esta definido, la moneda del formulario se bloquea y se fuerza
   * al valor dado al guardar. Usado para proveedores de carbon.
   */
  monedaFija?: Moneda;
}

export const useEdicionCuentaBancaria = ({
  onSuccess,
  onClose,
  monedaFija,
}: UseEdicionCuentaBancariaProps) => {
  const { notifySuccess, notifyError } = useNotify();

  const [idCuentaBancaria, setIdCuentaBancaria] = useState<number | null>(null);
  const [bancos, setBancos] = useState<RES_Banco[]>([]);
  const [idBanco, setIdBanco] = useState<string | null>(null);
  const [moneda, setMoneda] = useState<Moneda>(monedaFija ?? Moneda.Soles);
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [cci, setCci] = useState("");
  const [esParaDetraccion, setEsParaDetraccion] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargarBancos = useCallback(async () => {
    try {
      const data = await AuxService.get_bancos();
      setBancos(data.data);
    } catch (err) {
      console.error("Error al cargar bancos", err);
      notifyError("Error al cargar los bancos");
    }
  }, [notifyError]);

  const cargarCuenta = useCallback((cuenta: CuentaBancariaResponse) => {
    setIdCuentaBancaria(cuenta.id_cuenta_bancaria);
    setIdBanco(String(cuenta.id_banco));
    setMoneda(cuenta.moneda);
    setNumeroCuenta(cuenta.numero_cuenta);
    setCci(cuenta.cci ?? "");
    setEsParaDetraccion(Boolean(cuenta.es_para_detraccion));
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIdCuentaBancaria(null);
    setIdBanco(null);
    setMoneda(Moneda.Soles);
    setNumeroCuenta("");
    setCci("");
    setEsParaDetraccion(false);
    setError(null);
  }, []);

  const bancoSeleccionado =
    bancos.find((b) => String(b.id_banco) === idBanco) ?? null;
  const esBancoNacional = Boolean(bancoSeleccionado?.es_nacional);
  const esMonedaSoles = moneda === Moneda.Soles;
  const detraccionHabilitada = esBancoNacional && esMonedaSoles;

  const handleBancoChange = (val: string | null) => {
    setIdBanco(val);
    if (error) setError(null);
    const banco = bancos.find((b) => String(b.id_banco) === val);
    if (!banco) return;
    const nuevoEsBancoNacional = Boolean(banco.es_nacional);
    if (esParaDetraccion && (!nuevoEsBancoNacional || !esMonedaSoles)) {
      setEsParaDetraccion(false);
    }
  };

  const handleMonedaChange = (val: Moneda | null) => {
    if (!val) return;
    // Si la moneda esta forzada, ignoramos cambios.
    if (monedaFija) return;
    setMoneda(val);
    if (error) setError(null);
    if (esParaDetraccion && val !== Moneda.Soles) {
      setEsParaDetraccion(false);
    }
  };

  const handleNumeroCuentaChange = (val: string) => {
    setNumeroCuenta(val);
    if (error) setError(null);
  };

  const handleCciChange = (val: string) => {
    setCci(val);
    if (error) setError(null);
  };

  const handleDetraccionChange = (val: boolean) => {
    setEsParaDetraccion(val);
    if (error) setError(null);
  };

  const handleGuardar = async () => {
    if (idCuentaBancaria === null) {
      setError("No se ha cargado ninguna cuenta para editar.");
      return;
    }

    const payload = {
      id_banco: idBanco ? Number(idBanco) : 0,
      // Defensa final: forzar moneda si aplica.
      moneda: monedaFija ?? moneda,
      numero_cuenta: numeroCuenta.trim(),
      cci: cci.trim() || null,
      es_para_detraccion: esParaDetraccion,
    };

    const result = Schema_EditarCuentaBancaria.safeParse(payload);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }

    setIsSubmitting(true);
    try {
      const cuentaActualizada =
        await ProveedoresService.actualizarCuentaBancaria(
          idCuentaBancaria,
          result.data,
        );
      notifySuccess("Cuenta bancaria actualizada correctamente");
      onSuccess?.(cuentaActualizada);
      onClose();
      reset();
    } catch (err) {
      console.error(err);
      notifyError("Error inesperado al actualizar la cuenta bancaria");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    bancos,
    cargarBancos,
    cargarCuenta,
    idBanco,
    setIdBanco: handleBancoChange,
    moneda,
    setMoneda: handleMonedaChange,
    monedaFija,
    numeroCuenta,
    setNumeroCuenta: handleNumeroCuentaChange,
    cci,
    setCci: handleCciChange,
    esParaDetraccion,
    setEsParaDetraccion: handleDetraccionChange,
    esBancoNacional,
    esMonedaSoles,
    detraccionHabilitada,
    error,
    isSubmitting,
    handleGuardar,
    reset,
  };
};
