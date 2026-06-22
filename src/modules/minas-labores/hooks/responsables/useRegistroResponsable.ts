import { useState, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import { MinasService } from "../../service/minas.service";
import { Schema_AsignarResponsable } from "../../service/minas.requests";
import type {
  RES_EmpleadoDisponible,
  RES_HistorialResponsable,
} from "../../service/minas.responses";
import { AuxService } from "../../../../service/auxiliar.service";

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
  const [fechaInicio, setFechaInicio] = useState<Date | null>(new Date());
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargarDisponibles = useCallback(async () => {
    setLoadingDisponibles(true);
    try {
      const res = await AuxService.get_empleados({
        id_mina_excluyente: idMina,
      });
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
    setFechaInicio(new Date());
    setFormError("");
  }, []);

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const agregarDisponible = (empleado: RES_EmpleadoDisponible) => {
    setEmpleadosDisponibles((prev) => {
      if (prev.find((e) => e.id_empleado === empleado.id_empleado)) return prev;
      return [empleado, ...prev];
    });
  };

  const handleSubmit = async () => {
    setFormError("");
    const validation = Schema_AsignarResponsable.safeParse({
      id_mina: idMina,
      id_empleado: idEmpleado,
      fecha_inicio: fechaInicio ? dayjs(fechaInicio).format("YYYY-MM-DD") : "",
    });

    if (!validation.success) {
      setFormError(validation.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await MinasService.asignarResponsable(validation.data);
      if (res.success) {
        onSuccess(res.data);
        resetForm();
        // Actualizamos la lista local de disponibles eliminando al que ya fue asignado
        setEmpleadosDisponibles((prev) =>
          prev.filter((e) => e.id_empleado !== idEmpleado),
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
    agregarDisponible,
  };
};
