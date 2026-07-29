import { useState, useMemo, useCallback } from "react";
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

export type TipoLugarProgramacion = "" | "almacen" | "labor" | "oficina";

export interface AsignarHorarioPrefill {
  id_turno_laboral?: number;
  fecha_inicio?: string;
  por_tiempo_indefinido?: boolean | number;
  fecha_fin?: string | null;
  dias_laborables?: string;
  id_oficina?: number | null;
  id_almacen?: number | null;
  id_labor?: number | null;
  empleados?: number[];
  tipo_lugar?: TipoLugarProgramacion;
}

export const useAsignarHorario = (
  onSuccess?: (resultado: RES_ProgramacionAsignada) => void,
  prefill?: AsignarHorarioPrefill,
  empleadosPreseleccionados?: number[],
) => {
  const { notifySuccess, notifyError, notifyInfo } = useNotify();
  const [form, setForm] = useState<DTO_AsignarHorario>(() => {
    const base = initialForm();
    if (!prefill) return base;
    return {
      ...base,
      fecha_inicio: prefill.fecha_inicio ?? base.fecha_inicio,
      por_tiempo_indefinido: prefill.por_tiempo_indefinido !== undefined
        ? Boolean(prefill.por_tiempo_indefinido)
        : base.por_tiempo_indefinido,
      fecha_fin: prefill.fecha_fin ?? base.fecha_fin,
      dias_laborables: prefill.dias_laborables ?? base.dias_laborables,
      id_oficina: prefill.id_oficina ?? base.id_oficina,
      id_almacen: prefill.id_almacen ?? base.id_almacen,
      id_labor: prefill.id_labor ?? base.id_labor,
      id_turno_laboral: prefill.id_turno_laboral ?? base.id_turno_laboral,
      empleados: prefill.empleados ?? empleadosPreseleccionados ?? base.empleados,
    };
  });
  const [loading, setLoading] = useState(false);
  const [tipoLugar, setTipoLugar] = useState<TipoLugarProgramacion>(
    () => {
      if (prefill?.tipo_lugar) return prefill.tipo_lugar;
      if (prefill?.id_almacen) return "almacen";
      if (prefill?.id_labor) return "labor";
      if (prefill?.id_oficina) return "oficina";
      return "";
    },
  );

  const setField = useCallback(
    <K extends keyof DTO_AsignarHorario>(
      field: K,
      value: DTO_AsignarHorario[K],
    ) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const toggleDia = (indice: number) => {
    setForm((prev) => {
      const arr = prev.dias_laborables.split("");
      arr[indice] = arr[indice] === "1" ? "0" : "1";
      return { ...prev, dias_laborables: arr.join("") };
    });
  };

  const handleSetTipoLugar = (value: TipoLugarProgramacion) => {
    setTipoLugar(value);
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
      const next: typeof prev = { ...prev, empleados: [] };
      next.id_almacen = null;
      next.id_labor = null;
      next.id_oficina = null;
      if (tipoLugar === "almacen") next.id_almacen = id;
      else if (tipoLugar === "labor") next.id_labor = id;
      else if (tipoLugar === "oficina") next.id_oficina = id;
      return next;
    });
  };

  const lugarIdActual = useMemo<number | null>(() => {
    if (tipoLugar === "almacen") return form.id_almacen ?? null;
    if (tipoLugar === "labor") return form.id_labor ?? null;
    if (tipoLugar === "oficina") return form.id_oficina ?? null;
    return null;
  }, [tipoLugar, form.id_almacen, form.id_labor, form.id_oficina]);

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