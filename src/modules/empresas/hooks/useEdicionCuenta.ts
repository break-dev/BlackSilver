import { useState, useCallback } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { AuxService } from "../../../service/auxiliar.service";
import { CuentasEmpresaService } from "../service/cuentas-empresa.service";
import { Schema_EditarCuenta } from "../service/cuentas-empresa.requests";
import { Moneda } from "../../../shared/enums/_generic/moneda";
import type { RES_Banco } from "../../../service/responses/banco";
import type { RES_CuentaEmpresa } from "../../../service/responses/cuenta-empresa";

interface UseEdicionCuentaProps {
  onSuccess?: (cuentaActualizada: RES_CuentaEmpresa) => void;
  onClose: () => void;
}

export const useEdicionCuenta = ({
  onSuccess,
  onClose,
}: UseEdicionCuentaProps) => {
  const { notifySuccess, notifyError } = useNotify();

  const [idCuentaBancaria, setIdCuentaBancaria] = useState<number | null>(null);
  const [bancos, setBancos] = useState<RES_Banco[]>([]);
  const [idBanco, setIdBanco] = useState<string | null>(null);
  const [moneda, setMoneda] = useState<Moneda>(Moneda.Soles);
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [cci, setCci] = useState("");
  const [esParaDetraccion, setEsParaDetraccion] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cargarBancos = useCallback(async () => {
    try {
      const res = await AuxService.get_bancos();
      if (res.success) setBancos(res.data);
    } catch (err) {
      console.error("Error al cargar bancos", err);
    }
  }, []);

  const cargarCuenta = useCallback((cuenta: RES_CuentaEmpresa) => {
    setIdCuentaBancaria(cuenta.id_cuenta_bancaria);
    setIdBanco(String(cuenta.id_banco));
    setMoneda(cuenta.moneda);
    setNumeroCuenta(cuenta.numero_cuenta);
    setCci(cuenta.cci ?? "");
    setEsParaDetraccion(Boolean(cuenta.es_para_detraccion));
    setError("");
  }, []);

  const reset = useCallback(() => {
    setIdCuentaBancaria(null);
    setIdBanco(null);
    setMoneda(Moneda.Soles);
    setNumeroCuenta("");
    setCci("");
    setEsParaDetraccion(false);
    setError("");
  }, []);

const bancoSeleccionado =
    bancos.find((b) => String(b.id_banco) === idBanco) ?? null;
  const esBancoNacional = Boolean(bancoSeleccionado?.es_nacional);
  const esMonedaSoles = moneda === Moneda.Soles;
  const detraccionHabilitada = esBancoNacional && esMonedaSoles;

  const handleBancoChange = (val: string | null) => {
    setIdBanco(val);
    setError("");
    const banco = bancos.find((b) => String(b.id_banco) === val);
    if (!banco) return;
    const nuevoEsBancoNacional = Boolean(banco.es_nacional);
    if (esParaDetraccion && (!nuevoEsBancoNacional || moneda !== Moneda.Soles)) {
      setEsParaDetraccion(false);
    }
  };

  const handleMonedaChange = (val: Moneda | null) => {
    if (!val) return;
    setMoneda(val);
    if (esParaDetraccion && val !== Moneda.Soles) {
      setEsParaDetraccion(false);
    }
  };

  const handleGuardar = async () => {
    setError("");

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

    const result = Schema_EditarCuenta.safeParse(payload);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }

    setLoading(true);
    try {
      const response = await CuentasEmpresaService.actualizar_cuenta(
        idCuentaBancaria,
        result.data,
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
      setLoading(false);
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
    setNumeroCuenta,
    cci,
    setCci,
    esParaDetraccion,
    setEsParaDetraccion,
    esBancoNacional,
    esMonedaSoles,
    detraccionHabilitada,
    error,
    loading,
    handleGuardar,
    reset,
  };
};