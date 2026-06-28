import { useState, useEffect } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { OrganigramaService } from "../service/organigrama.service";
import { Schema_RegistroCargo } from "../service/organigrama.requests";
import type { RES_Cargo } from "../../../service/responses/organigrama";

export const useRegistroCargo = (
  onSuccess: (c: RES_Cargo) => void,
  onClose: () => void,
  defaultAreaId?: number | null,
) => {
  const { notifySuccess } = useNotify();
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // idArea es controlado externamente desde la UI cuando se registra desde una tarjeta de área
  const [idArea, setIdArea] = useState<number | null>(defaultAreaId ?? null);

  useEffect(() => {
    setIdArea(defaultAreaId ?? null);
  }, [defaultAreaId]);

  const handleGuardar = async () => {
    setError("");
    const validation = Schema_RegistroCargo.safeParse({
      nombre,
      id_area: idArea,
    });

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const resp = await OrganigramaService.crear_cargo(validation.data);
      if (resp.success) {
        notifySuccess("Cargo creado correctamente");
        onSuccess(resp.data);
        onClose();
        setNombre("");
      } else {
        setError(resp.message);
      }
    } catch {
      setError("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return {
    nombre,
    setNombre,
    idArea,
    setIdArea,
    loading,
    error,
    handleGuardar,
  };
};
