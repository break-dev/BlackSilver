import { useState, useCallback } from "react";
import { MinasService } from "../service/minas.service";
import { Schema_CrearMina } from "../service/minas.requests";
import type { RES_ConcesionItem, RES_ResumenMina } from "../service/minas.responses";

interface Props {
  concesiones: RES_ConcesionItem[];
  onSuccess: (nueva: RES_ResumenMina) => void;
  onCancel: () => void;
}

export const useRegistroMina = ({
  concesiones: _concesiones,
  onSuccess,
  onCancel,
}: Props) => {
  const [idConcesion, setIdConcesion] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setIdConcesion(null);
    setNombre("");
    setDescripcion("");
    setFormError("");
  }, []);

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleSubmit = async () => {
    setFormError("");

    const validation = Schema_CrearMina.safeParse({
      id_concesion: idConcesion ? Number(idConcesion) : undefined,
      nombre,
      descripcion: descripcion || undefined,
    });

    if (!validation.success) {
      setFormError(validation.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await MinasService.crearMina(validation.data);
      if (res.success) {
        onSuccess(res.data);
        resetForm();
      } else {
        setFormError(res.message);
      }
    } catch {
      setFormError("Error inesperado al crear la mina");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    idConcesion,
    setIdConcesion,
    nombre,
    setNombre,
    descripcion,
    setDescripcion,
    formError,
    isSubmitting,
    handleSubmit,
    handleCancel,
  };
};
