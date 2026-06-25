import { useState } from "react";
import { AuxService } from "../../../service/auxiliar.service";
import { useNotify } from "../../../hooks/useNotify";
import type { RES_Banco } from "../../../service/responses/banco";
import { z } from "zod";

const Schema_CrearBanco = z.object({
  nombre: z.string().min(1, "El nombre del banco es requerido"),
  abreviatura: z.string().min(1, "La abreviatura es requerida"),
});
type CrearBancoRequest = z.infer<typeof Schema_CrearBanco>;

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
      if (response.success) {
        notifySuccess("Banco registrado exitosamente");
        setPayload({ nombre: "", abreviatura: "" });
        onSuccess(response.data);
      } else {
        setError(response.message);
      }
    } catch (e) {
      console.error(e);
      notifyError("Error al registrar banco");
    } finally {
      setLoading(false);
    }
  };

  return { payload, handleChange, submit, loading, error };
};
