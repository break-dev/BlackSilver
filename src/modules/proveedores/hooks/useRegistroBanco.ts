import { useState } from "react";
import { useNotify } from "../../../hooks/useNotify";
import {
  Schema_CrearBanco,
  type CrearBancoRequest,
} from "../service/proveedores.requests";
import type { RES_Banco } from "../../../service/responses/banco";
import { AuxService } from "../../../service/auxiliar.service";

export const useRegistroBanco = (onSuccess: (banco: RES_Banco) => void) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notifySuccess, notifyError } = useNotify();

  const [payload, setPayload] = useState<CrearBancoRequest>({
    nombre: "",
    abreviatura: "",
  });

  const handleChange = (field: keyof CrearBancoRequest, value: string) => {
    setPayload((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const validation = Schema_CrearBanco.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const response = await AuxService.crear_banco(validation.data);
      notifySuccess("Banco registrado exitosamente");
      setPayload({ nombre: "", abreviatura: "" });
      onSuccess(response.data);
    } catch (e) {
      console.error(e);
      notifyError("Error al registrar banco");
    } finally {
      setLoading(false);
    }
  };

  return { payload, handleChange, submit, loading, error };
};
