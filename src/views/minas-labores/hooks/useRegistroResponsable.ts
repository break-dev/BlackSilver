import { useState, useCallback, useEffect } from "react";
import { MinasService } from "../service/minas.service";
import { Schema_AsignarResponsable } from "../service/minas.requests";
import type {
  RES_EmpleadoDisponible,
  RES_HistorialResponsable,
} from "../service/minas.responses";

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
  const [empleadosDisponibles, setEmpleadosDisponibles] = useState<
    RES_EmpleadoDisponible[]
  >([]);
  const [loadingDisponibles, setLoadingDisponibles] = useState(false);

  const [idEmpleado, setIdEmpleado] = useState<number | null>(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargarDisponibles = useCallback(async () => {
    setLoadingDisponibles(true);
    try {
      const { data: res } = await MinasService.getEmpleadosDisponibles(idMina);
      if (res.success) setEmpleadosDisponibles(res.data);
    } finally {
      setLoadingDisponibles(false);
    }
  }, [idMina]);

  useEffect(() => {
    cargarDisponibles();
  }, [cargarDisponibles]);

  const resetForm = useCallback(() => {
    setIdEmpleado(null);
    setFechaInicio("");
    setFormError("");
  }, []);

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleSubmit = async () => {
    setFormError("");
    const validation = Schema_AsignarResponsable.safeParse({
      id_mina: idMina,
      id_empleado: idEmpleado,
      fecha_inicio: fechaInicio,
    });

    if (!validation.success) {
      setFormError(validation.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: res } = await MinasService.asignarResponsable(
        validation.data,
      );
      if (res.success) {
        onSuccess(res.data);
        resetForm();
        cargarDisponibles(); // Recargar la lista de la API
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
    empleadosDisponibles,
    loadingDisponibles,
    idEmpleado,
    setIdEmpleado,
    fechaInicio,
    setFechaInicio,
    formError,
    isSubmitting,
    handleSubmit,
    handleCancel,
  };
};
