import { useState } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { OrganigramaService } from "../service/organigrama.service";
import { Schema_RegistroArea } from "../service/organigrama.requests";
import type { RES_Area } from "../../../service/responses/organigrama";

export const useRegistroArea = (
  onSuccess: (a: RES_Area) => void,
  onClose: () => void,
) => {
  const { notifySuccess } = useNotify();
  const [nombre, setNombre] = useState("");
  const [cargos, setCargos] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addCargo = () => setCargos((prev) => [...prev, ""]);

  const removeCargo = (index: number) =>
    setCargos((prev) => prev.filter((_, i) => i !== index));

  const updateCargo = (index: number, value: string) =>
    setCargos((prev) => prev.map((c, i) => (i === index ? value : c)));

  const handleGuardar = async () => {
    setError("");

    const cargosValidos = cargos
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
      .map((c) => ({ nombre: c }));

    const validation = Schema_RegistroArea.safeParse({
      nombre,
      cargos: cargosValidos,
    });

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const resp = await OrganigramaService.crear_area(validation.data);
      if (resp.success) {
        notifySuccess("Área creada correctamente");
        onSuccess(resp.data);
        onClose();
        setNombre("");
        setCargos([""]);
      } else {
        setError(resp.message);
      }
    } catch (err) {
      console.error(err);
      setError("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return {
    nombre,
    setNombre,
    cargos,
    addCargo,
    removeCargo,
    updateCargo,
    loading,
    error,
    handleGuardar,
  };
};
