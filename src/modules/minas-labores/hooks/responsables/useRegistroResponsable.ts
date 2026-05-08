import { useState, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import { MinasService } from "../../service/minas.service";
import { Schema_AsignarResponsable } from "../../service/minas.requests";
import type {
  RES_ContratistaDisponible,
  RES_HistorialResponsable,
} from "../../service/minas.responses";

interface Props {
  idMina: number;
  onSuccess: (nueva: RES_HistorialResponsable) => void;
  onCancel: () => void;
}

export const useRegistroResponsable = ({
  idMina,
  onSuccess,
  onCancel,
}: Props) => {
  const [contratistasDisponibles, setContratistasDisponibles] = useState<
    RES_ContratistaDisponible[]
  >([]);
  const [loadingDisponibles, setLoadingDisponibles] = useState(false);

  const [idContratista, setIdContratista] = useState<number | null>(null);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(new Date());
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargarDisponibles = useCallback(async () => {
    setLoadingDisponibles(true);
    try {
      const res = await MinasService.getContratistasDisponibles(idMina);
      if (res.success) setContratistasDisponibles(res.data);
    } finally {
      setLoadingDisponibles(false);
    }
  }, [idMina]);

  useEffect(() => {
    cargarDisponibles();
  }, [cargarDisponibles]);

  const resetForm = useCallback(() => {
    setIdContratista(null);
    setFechaInicio(new Date());
    setFormError("");
  }, []);

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const agregarDisponible = (contratista: RES_ContratistaDisponible) => {
    setContratistasDisponibles((prev) => {
      if (prev.find((e) => e.id_contratista === contratista.id_contratista)) return prev;
      return [contratista, ...prev];
    });
  };

  const handleSubmit = async () => {
    setFormError("");
    const validation = Schema_AsignarResponsable.safeParse({
      id_mina: idMina,
      id_contratista: idContratista,
      fecha_inicio: fechaInicio ? dayjs(fechaInicio).format("YYYY-MM-DD") : "",
    });

    if (!validation.success) {
      setFormError(validation.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await MinasService.asignarResponsable(
        validation.data,
      );
      if (res.success) {
        onSuccess(res.data);
        resetForm();
        // Actualizamos la lista local de disponibles eliminando al que ya fue asignado
        setContratistasDisponibles((prev) =>
          prev.filter((e) => e.id_contratista !== idContratista),
        );
      } else {
        setFormError(res.message);
      }
    } catch {
      setFormError("Error inesperado al asignar el responsable");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    contratistasDisponibles,
    loadingDisponibles,
    idContratista,
    setIdContratista,
    fechaInicio,
    setFechaInicio,
    formError,
    isSubmitting,
    handleSubmit,
    handleCancel,
    agregarDisponible,
  };
};
