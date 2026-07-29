import { useState, useCallback } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { AuxService } from "../../../service/auxiliar.service";
import { ClientesService } from "../service/clientes.service";
import {
  Schema_EditarCuentaBancaria,
} from "../service/clientes.requests";
import { Moneda } from "../../../shared/enums/_generic/moneda";
import type { RES_Banco } from "../../../service/responses/banco";
import type { CuentaBancariaResponse } from "../service/clientes.responses";

interface UseEdicionCuentaBancariaProps {
  onSuccess?: (cuentaActualizada: CuentaBancariaResponse) => void;
  onClose: () => void;
}

export const useEdicionCuentaBancaria = ({
  onSuccess,
  onClose,
}: UseEdicionCuentaBancariaProps) => {
  const { notifySuccess, notifyError } = useNotify();

  const [idCuentaBancaria, setIdCuentaBancaria] = useState<number | null>(null);
  const [bancos, setBancos] = useState<RES_Banco[]>([]);
  const [idBanco, setIdBanco] = useState<string | null>(null);
  const [moneda, setMoneda] = useState<Moneda>(Moneda.Soles);
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [cci, setCci] = useState("");
  const [esParaDetraccion, setEsParaDetraccion] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargarBancos = useCallback(async () => {
    try {
      const res = await AuxService.get_bancos();
      if (res.success) setBancos(res.data);
    } catch (err) {
      console.error("Error al cargar bancos", err);
    }
  }, []);

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
    setError(null);
    const banco = bancos.find((b) => String(b.id_banco) === val);
    if (!banco) return;
    const nuevoEsBancoNacional = Boolean(banco.es_nacional);
    if (
      esParaDetraccion &&
      (!nuevoEsBancoNacional || moneda !== Moneda.Soles)
    ) {
      setEsParaDetraccion(false);
    }
  };

  const handleMonedaChange = (val: Moneda | null) => {
    if (!val) return;
    setMoneda(val);
    setError(null);
    if (esParaDetraccion && val !== Moneda.Soles) {
      setEsParaDetraccion(false);
    }
  };

  const handleNumeroCuentaChange = (val: string) => {
    setNumeroCuenta(val.replace(/\D/g, ""));
    if (error) setError(null);
  };

  const handleCciChange = (val: string) => {
    setCci(val.replace(/\D/g, ""));
    if (error) setError(null);
  };

  const handleGuardar = async () => {
    setError(null);

    if (idCuentaBancaria === null) {
      setError("No se ha cargado ninguna cuenta para editar.");
      return;
    }

    const payload = {
      id_banco: idBanco ? Number(idBanco) : 0,
      moneda,
      numero_cuenta: numeroCuenta.trim(),
      cci: cci.trim() || undefined,
      es_para_detraccion: esParaDetraccion,
    };

    const result = Schema_EditarCuentaBancaria.safeParse(payload);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await ClientesService.actualizarCuentaBancaria(
        idCuentaBancaria,
        result.data
      );
      if (response.success && response.data) {
        notifySuccess("Cuenta bancaria actualizada correctamente");
        onSuccess?.(response.data);
        onClose();
        reset();
      } else {
        setError(response.message);
      }
    } catch (err) {
      notifyError("Error inesperado al actualizar la cuenta bancaria");
      console.error(err);
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
    numeroCuenta,
    setNumeroCuenta: handleNumeroCuentaChange,
    cci,
    setCci: handleCciChange,
    esParaDetraccion,
    setEsParaDetraccion,
    esBancoNacional,
    esMonedaSoles,
    detraccionHabilitada,
    error,
    isSubmitting,
    handleGuardar,
    reset,
  };
};