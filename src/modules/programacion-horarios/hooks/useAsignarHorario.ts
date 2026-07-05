import { useState } from "react";
import { ProgramacionHorarioService } from "../service/programacion.service";
import {
  Schema_AsignarHorario,
  type DTO_AsignarHorario,
} from "../service/programacion.requests";
import { useNotify } from "../../../hooks/useNotify";
import type { RES_ProgramacionAsignada } from "../service/programacion.responses";

const initialForm = (): DTO_AsignarHorario => ({
  id_turno_laboral: 0,
  fecha_inicio: new Date().toISOString().split("T")[0],
  por_tiempo_indefinido: false,
  fecha_fin: null,
  dias_laborables: "0000000",
  empleados: [],
});

export const useAsignarHorario = (
  onSuccess?: (resultado: RES_ProgramacionAsignada) => void,
) => {
  const { notifySuccess, notifyError } = useNotify();
  const [form, setForm] = useState<DTO_AsignarHorario>(initialForm());
  const [loading, setLoading] = useState(false);

  const setField = <K extends keyof DTO_AsignarHorario>(
    field: K,
    value: DTO_AsignarHorario[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDia = (indice: number) => {
    setForm((prev) => {
      const arr = prev.dias_laborables.split("");
      arr[indice] = arr[indice] === "1" ? "0" : "1";
      return { ...prev, dias_laborables: arr.join("") };
    });
  };

  const reset = () => setForm(initialForm());

  const handleSubmit = async () => {
    const validation = Schema_AsignarHorario.safeParse(form);
    if (!validation.success) {
      notifyError(validation.error.issues[0].message);
      return null;
    }
    setLoading(true);
    try {
      const resp = await ProgramacionHorarioService.asignar_horario(
        validation.data,
      );
      if (resp.success) {
        const resultado = resp.data as RES_ProgramacionAsignada;
        if (resultado.total_rechazados > 0) {
          const listaMotivos = resultado.rechazados.map((r) => r.motivo).join("\n");
          if (resultado.total_creados > 0) {
            notifySuccess(`Se asignó el horario a ${resultado.total_creados} empleado(s).`);
            notifyError(`No se pudo asignar a ${resultado.total_rechazados} empleado(s):\n${listaMotivos}`);
          } else {
            notifyError(`No se pudo asignar el horario:\n${listaMotivos}`);
          }
        } else {
          notifySuccess(resp.message ?? "Horario asignado correctamente");
        }
        onSuccess?.(resultado);
        reset();
        return resultado;
      }
      notifyError(resp.message ?? "No se pudo asignar el horario");
      return null;
    } catch (err) {
      console.error(err);
      notifyError("Error inesperado al asignar el horario");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setField,
    toggleDia,
    reset,
    loading,
    handleSubmit,
  };
};