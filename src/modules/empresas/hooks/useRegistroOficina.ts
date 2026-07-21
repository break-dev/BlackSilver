import { useState, useCallback } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { OficinasService } from "../service/oficinas.service";
import { Schema_RegistroOficina } from "../service/oficinas.requests";
import type { RES_Oficina } from "../../../service/responses/oficina";

interface UseRegistroOficinaProps {
  onSuccess?: (nueva: RES_Oficina) => void;
  onClose: () => void;
}

export const useRegistroOficina = ({
  onSuccess,
  onClose,
}: UseRegistroOficinaProps) => {
  const { notifySuccess, notifyError } = useNotify();

  const [idEmpresa, setIdEmpresa] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [esPrincipal, setEsPrincipal] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    setIdEmpresa(null);
    setNombre("");
    setDireccion("");
    setEsPrincipal(false);
    setError("");
  }, []);

  const handleGuardar = async () => {
    setError("");

    if (idEmpresa === null) {
      setError("No se ha vinculado la oficina a ninguna empresa.");
      return;
    }

    const payload = {
      id_empresa: idEmpresa,
      nombre: nombre.trim(),
      direccion: direccion.trim() || undefined,
      es_principal: esPrincipal,
    };

    const result = Schema_RegistroOficina.safeParse(payload);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }

    setLoading(true);
    try {
      const response = await OficinasService.crear_oficina(result.data);
      if (response.success) {
        notifySuccess("Oficina registrada correctamente");
        onSuccess?.(response.data);
        onClose();
        reset();
      } else {
        setError(response.message);
      }
    } catch (err) {
      notifyError("Error inesperado al registrar la oficina");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    idEmpresa,
    setIdEmpresa,
    nombre,
    setNombre,
    direccion,
    setDireccion,
    esPrincipal,
    setEsPrincipal,
    error,
    loading,
    handleGuardar,
    reset,
  };
};
