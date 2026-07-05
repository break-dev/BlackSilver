import { useState } from "react";
import { TurnoLaboralService } from "../service/turnos.service";
import {
  Schema_CrearTurno,
  Schema_ActualizarTurno,
  type DTO_ActualizarTurno,
  type DTO_CrearTurno,
} from "../service/turnos.requests";
import { useNotify } from "../../../hooks/useNotify";
import type { RES_TurnoLaboral } from "../service/turnos.responses";
import { TipoTurno } from "../service/tipo-turno";

const initialForm = (): DTO_CrearTurno => ({
  tipo_turno: TipoTurno.Dia,
  hora_ingreso: "",
  hora_salida: "",
  minutos_tolerancia: null,
  estado: "Activo",
});

export const useRegistroTurno = (
  onSuccess?: (turno: RES_TurnoLaboral) => void,
) => {
  const { notifySuccess, notifyError } = useNotify();
  const [form, setForm] = useState<DTO_CrearTurno>(initialForm());
  const [loading, setLoading] = useState(false);

  const setField = <K extends keyof DTO_CrearTurno>(
    field: K,
    value: DTO_CrearTurno[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const reset = () => setForm(initialForm());

  const precargar = (turno: RES_TurnoLaboral) => {
    setForm({
      tipo_turno: (turno.tipo_turno as DTO_CrearTurno["tipo_turno"]) ?? "Dia",
      hora_ingreso: (turno.hora_ingreso ?? "").slice(0, 5),
      hora_salida: (turno.hora_salida ?? "").slice(0, 5),
      minutos_tolerancia: turno.minutos_tolerancia ?? null,
      estado: (turno.estado as DTO_CrearTurno["estado"]) ?? "Activo",
    });
  };

  const handleSubmitCrear = async () => {
    const validation = Schema_CrearTurno.safeParse(form);
    if (!validation.success) {
      notifyError(validation.error.issues[0].message);
      return null;
    }
    setLoading(true);
    try {
      const resp = await TurnoLaboralService.crear_turno(validation.data);
      if (resp.success) {
        notifySuccess(resp.message ?? "Turno registrado correctamente");
        const turno = resp.data as RES_TurnoLaboral;
        onSuccess?.(turno);
        reset();
        return turno;
      }
      notifyError(resp.message ?? "Error al registrar el turno");
      return null;
    } catch (err) {
      console.error(err);
      notifyError("Error inesperado al registrar el turno");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEditar = async (idTurno: number) => {
    const payload: Partial<DTO_ActualizarTurno> = {};
    if (form.tipo_turno) payload.tipo_turno = form.tipo_turno;
    if (form.hora_ingreso) payload.hora_ingreso = form.hora_ingreso;
    if (form.hora_salida) payload.hora_salida = form.hora_salida;
    payload.minutos_tolerancia = form.minutos_tolerancia ?? null;

    const validation = Schema_ActualizarTurno.safeParse(payload);
    if (!validation.success) {
      notifyError(validation.error.issues[0].message);
      return null;
    }
    setLoading(true);
    try {
      const resp = await TurnoLaboralService.actualizar_turno(
        idTurno,
        validation.data,
      );
      if (resp.success) {
        notifySuccess(resp.message ?? "Turno actualizado");
        const turno = resp.data as RES_TurnoLaboral;
        onSuccess?.(turno);
        reset();
        return turno;
      }
      notifyError(resp.message ?? "Error al actualizar el turno");
      return null;
    } catch (err) {
      console.error(err);
      notifyError("Error inesperado al actualizar el turno");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setField,
    reset,
    precargar,
    loading,
    handleSubmitCrear,
    handleSubmitEditar,
  };
};