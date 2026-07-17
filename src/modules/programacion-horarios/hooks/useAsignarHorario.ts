import { useState, useMemo } from "react";
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
  id_oficina: null,
  id_almacen: null,
  id_labor: null,
  empleados: [],
});

export const useAsignarHorario = (
  onSuccess?: (resultado: RES_ProgramacionAsignada) => void,
) => {
  const { notifySuccess, notifyError, notifyInfo } = useNotify();
  const [form, setForm] = useState<DTO_AsignarHorario>(initialForm());
  const [loading, setLoading] = useState(false);
  const [tipoLugar, setTipoLugar] = useState<"" | "almacen" | "labor">("");

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

  const handleSetTipoLugar = (value: "" | "almacen" | "labor") => {
    setTipoLugar(value);
    // Garantizar exclusividad: limpiar los 3 campos al cambiar, y vaciar empleados.
    setForm((prev) => ({
      ...prev,
      id_oficina: null,
      id_almacen: null,
      id_labor: null,
      empleados: [],
    }));
  };

  const handleSetLugarId = (id: number | null) => {
    setForm((prev) => {
      const next = { ...prev, empleados: [] };
      if (tipoLugar === "almacen") {
        next.id_almacen = id;
      } else if (tipoLugar === "labor") {
        next.id_labor = id;
      }
      return next;
    });
  };

  const lugarIdActual = useMemo<number | null>(() => {
    if (tipoLugar === "almacen") return form.id_almacen ?? null;
    if (tipoLugar === "labor") return form.id_labor ?? null;
    return null;
  }, [tipoLugar, form.id_almacen, form.id_labor]);

  const reset = () => {
    setForm(initialForm());
    setTipoLugar("");
  };

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
            notifyInfo(`No se pudo asignar a ${resultado.total_rechazados} empleado(s):\n${listaMotivos}`);
          } else {
            notifyInfo(`No se pudo asignar el horario:\n${listaMotivos}`);
          }
        } else {
          notifySuccess(resp.message ?? "Horario asignado correctamente");
        }
        onSuccess?.(resultado);
        reset();
        return resultado;
      }
      const errorPayload = resp as unknown as {
        errors?: {
          rechazados?: Array<{ motivo: string }>;
        };
      };
      if (errorPayload.errors?.rechazados && Array.isArray(errorPayload.errors.rechazados)) {
        const listaMotivos = errorPayload.errors.rechazados.map((r) => r.motivo).join("\n");
        notifyInfo(`No se pudo asignar el horario:\n${listaMotivos}`);
      } else {
        notifyError(resp.message ?? "No se pudo asignar el horario");
      }
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
    tipoLugar,
    setTipoLugar: handleSetTipoLugar,
    lugarIdActual,
    setLugarId: handleSetLugarId,
  };
};