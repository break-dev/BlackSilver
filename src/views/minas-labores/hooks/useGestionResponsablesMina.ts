import { useState, useEffect, useCallback } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useNotify } from "../../../hooks/useNotify";
import { MinasService } from "../service/minas.service";
import { Schema_AsignarResponsable } from "../service/minas.requests";
import type {
  RES_EmpleadoDisponible,
  RES_HistorialResponsable,
} from "../service/minas.responses";

interface Props {
  idMina: number;
  onResponsableAsignado?: (nombreResponsable: string) => void;
}

export const useGestionResponsablesMina = ({
  idMina,
  onResponsableAsignado,
}: Props) => {
  const { notify } = useNotify();

  const [historial, setHistorial] = useState<RES_HistorialResponsable[]>([]);
  const [empleadosDisponibles, setEmpleadosDisponibles] = useState<
    RES_EmpleadoDisponible[]
  >([]);
  const [loading, setLoading] = useState(false);

  const [openedForm, { open: openForm, close: closeForm }] =
    useDisclosure(false);

  // Form state
  const [idEmpleado, setIdEmpleado] = useState<number | null>(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setIdEmpleado(null);
    setFechaInicio("");
    setFormError("");
  }, []);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [resHistorial, resEmpleados] = await Promise.all([
        MinasService.getHistorialResponsables(idMina),
        MinasService.getEmpleadosDisponibles(idMina),
      ]);
      if (resHistorial.data.success) setHistorial(resHistorial.data.data);
      if (resEmpleados.data.success)
        setEmpleadosDisponibles(resEmpleados.data.data);
    } catch {
      notify({ type: "error", content: "Error al cargar los responsables" });
    } finally {
      setLoading(false);
    }
  }, [idMina, notify]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const asignarResponsable = async () => {
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
        setHistorial((prev) => [res.data, ...prev]);
        setEmpleadosDisponibles((prev) =>
          prev.filter((e) => e.id_empleado !== idEmpleado),
        );
        onResponsableAsignado?.(res.data.empleado);
        closeForm();
        resetForm();
        notify({
          type: "success",
          content: "Responsable asignado correctamente",
        });
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
    historial,
    empleadosDisponibles,
    loading,
    openedForm,
    openForm,
    closeForm,
    // Form
    idEmpleado,
    setIdEmpleado,
    fechaInicio,
    setFechaInicio,
    formError,
    isSubmitting,
    asignarResponsable,
    resetForm,
  };
};
