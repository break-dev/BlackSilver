import { useState } from "react";
import { TipoCarbonService } from "../service/tipo-carbon.service";
import {
  Schema_ActualizarTipoCarbon,
  Schema_CrearTipoCarbon,
  type ActualizarTipoCarbonRequest,
  type CrearTipoCarbonRequest,
} from "../service/tipo-carbon.requests";
import { useNotify } from "../../../hooks/useNotify";
import type { RES_TipoCarbon } from "../service/tipo-carbon.responses";

export const useRegistroTipoCarbon = (
  onSuccess: (t: RES_TipoCarbon) => void,
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notifySuccess, notifyError } = useNotify();

  const [payload, setPayload] = useState<CrearTipoCarbonRequest>({
    nombre: "",
    codigo: null,
  });

  const handleChange = <K extends keyof CrearTipoCarbonRequest>(
    field: K,
    value: CrearTipoCarbonRequest[K],
  ) => {
    setPayload((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const validation = Schema_CrearTipoCarbon.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const res = await TipoCarbonService.crearTipo(validation.data);
      if (res.success && res.data) {
        notifySuccess("Tipo de carbon registrado");
        setPayload({ nombre: "", codigo: null });
        onSuccess(res.data);
      }
    } catch (e) {
      console.error(e);
      notifyError("Error al registrar el tipo de carbon");
    } finally {
      setLoading(false);
    }
  };

  const actualizar = async (
    idTipoCarbon: number,
    payloadUpdate: ActualizarTipoCarbonRequest,
  ): Promise<RES_TipoCarbon | null> => {
    const validation = Schema_ActualizarTipoCarbon.safeParse(payloadUpdate);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return null;
    }
    setLoading(true);
    try {
      const res = await TipoCarbonService.actualizarTipo(
        idTipoCarbon,
        validation.data,
      );
      if (res.success && res.data) {
        notifySuccess("Tipo de carbon actualizado");
        onSuccess(res.data);
        return res.data;
      }
      return null;
    } catch (e) {
      console.error(e);
      notifyError("Error al actualizar el tipo de carbon");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (
    idTipoCarbon: number,
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await TipoCarbonService.eliminarTipo(idTipoCarbon);
      if (res.success) {
        notifySuccess("Tipo de carbon eliminado");
        return true;
      }
      notifyError(res.message || "No se pudo eliminar");
      return false;
    } catch (e) {
      console.error(e);
      notifyError("Error al eliminar el tipo de carbon");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    payload,
    loading,
    error,
    handleChange,
    submit,
    actualizar,
    eliminar,
  };
};