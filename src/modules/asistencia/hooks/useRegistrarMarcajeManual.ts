import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { AsistenciaService } from "../service/asistencia.service";
import type { DTO_MarcajeManual } from "../service/asistencia.requests";
import { useNotify } from "../../../hooks/useNotify";

interface InitialState {
  id_empleado: string;
  fecha_hora: string;
  tipo_marcaje: "Ingreso" | "Salida" | "";
  id_programacion_horario: string;
  observaciones: string;
}

const INITIAL: InitialState = {
  id_empleado: "",
  fecha_hora: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  tipo_marcaje: "",
  id_programacion_horario: "",
  observaciones: "",
};

export const useRegistrarMarcajeManual = (onSuccess?: () => void) => {
  const { notifySuccess, notifyError } = useNotify();
  const [form, setForm] = useState<InitialState>(INITIAL);
  const [loading, setLoading] = useState(false);

  const setField = useCallback(<K extends keyof InitialState>(key: K, value: InitialState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setForm(INITIAL), []);

  const handleSubmit = useCallback(async () => {
    if (!form.id_empleado) {
      notifyError("Seleccione un empleado");
      return;
    }
    if (!form.tipo_marcaje) {
      notifyError("Seleccione el tipo de marcaje");
      return;
    }
    if (!form.fecha_hora) {
      notifyError("Indique la fecha y hora");
      return;
    }

    setLoading(true);
    try {
      const dto: DTO_MarcajeManual = {
        id_empleado: Number(form.id_empleado),
        fecha_hora: form.fecha_hora,
        tipo_marcaje: form.tipo_marcaje,
        id_programacion_horario: form.id_programacion_horario
          ? Number(form.id_programacion_horario)
          : null,
        observaciones: form.observaciones || null,
      };
      const resp = await AsistenciaService.registrar_marcaje_manual(dto);
      if (resp.success) {
        notifySuccess("Marcaje manual registrado");
        reset();
        onSuccess?.();
      } else {
        notifyError(resp.message ?? "No se pudo registrar el marcaje");
      }
    } catch (err) {
      console.error(err);
      notifyError("No se pudo registrar el marcaje manual");
    } finally {
      setLoading(false);
    }
  }, [form, notifyError, notifySuccess, onSuccess, reset]);

  useEffect(() => {
    return () => {
      // Reset al desmontar (cierre de modal externo).
      setForm(INITIAL);
    };
  }, []);

  return {
    form,
    setField,
    reset,
    loading,
    handleSubmit,
  };
};