import { useState } from "react";
import { ProveedoresService } from "../service/proveedores.service";
import { useNotify } from "../../../hooks/useNotify";
import {
  Schema_CrearCuentaBancaria,
  type CrearCuentaBancariaRequest,
} from "../service/proveedores.requests";

export const useRegistroCuentaBancaria = (
  idProveedor: number | null,
  onAccountAdded: () => void,
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notifySuccess, notifyError } = useNotify();

  const [payload, setPayload] = useState<CrearCuentaBancariaRequest>({
    id_proveedor: 0,
    id_banco: 0,
    moneda: "Soles",
    numero_cuenta: "",
    cci: "",
    es_para_detraccion: 0,
  });

  const handleChangeStr = (
    field: keyof CrearCuentaBancariaRequest,
    value: string,
  ) => {
    setPayload((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSelectBanco = (val: string | null) => {
    setPayload((prev) => ({ ...prev, id_banco: val ? Number(val) : 0 }));
    if (error) setError(null);
  };

  const handleToggleDetraccion = (checked: boolean) => {
    setPayload((prev) => ({ ...prev, es_para_detraccion: checked ? 1 : 0 }));
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!idProveedor) {
      setError("Falta enlazar el registro a un proveedor");
      return;
    }
    setError(null);

    const validation = Schema_CrearCuentaBancaria.safeParse({
      ...payload,
      id_proveedor: idProveedor,
    });

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      await ProveedoresService.crearCuentaBancaria(validation.data);
      notifySuccess("Cuenta bancaria añadida");
      setPayload({
        id_proveedor: 0,
        id_banco: 0,
        moneda: "Soles",
        numero_cuenta: "",
        cci: "",
        es_para_detraccion: 0,
      });
      onAccountAdded();
    } catch (e) {
      console.error(e);
      notifyError("Error al añadir la cuenta bancaria");
    } finally {
      setIsSubmitting(false);
    }
  };

  const autoSelectBanco = (idBanco: number) => {
    setPayload((prev) => ({ ...prev, id_banco: idBanco }));
  };

  return {
    payload,
    handleChangeStr,
    handleSelectBanco,
    handleToggleDetraccion,
    submit,
    isSubmitting,
    error,
    autoSelectBanco,
  };
};
