import { useState, useCallback } from "react";
import { MinasService } from "../service/minas.service";
import { Schema_CrearMina } from "../service/minas.requests";
import type { RES_ResumenMina } from "../service/minas.responses";

interface Props {
  idConcesion: number;
  onSuccess: (nueva: RES_ResumenMina) => void;
  onCancel: () => void;
}

export const useRegistroMina = ({
  idConcesion,
  onSuccess,
  onCancel,
}: Props) => {

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
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
      id_concesion: idConcesion,
      nombre,
      descripcion: descripcion || undefined,
    });

    if (!validation.success) {
      setFormError(validation.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: res } = await MinasService.crearMina(validation.data);
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
