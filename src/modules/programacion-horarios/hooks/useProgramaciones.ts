import { useCallback, useEffect, useMemo, useState } from "react";
import { ProgramacionHorarioService } from "../service/programacion.service";
import type { RES_ProgramacionHorario } from "../service/programacion.responses";
import { useNotify } from "../../../hooks/useNotify";

export interface RangoSemana {
  fecha_inicio: string;
  fecha_fin: string;
}

const formatYmd = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const inicioSemana = (base: Date): Date => {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
};

const finSemana = (inicio: Date): Date => {
  const d = new Date(inicio);
  d.setDate(d.getDate() + 6);
  return d;
};

export const useProgramaciones = () => {
  const { notifyError } = useNotify();
  const [fechaReferencia, setFechaReferencia] = useState<Date>(new Date());
  const [programaciones, setProgramaciones] = useState<RES_ProgramacionHorario[]>([]);
  const [loading, setLoading] = useState(false);

  const rango = useMemo<RangoSemana>(() => {
    const ini = inicioSemana(fechaReferencia);
    const fin = finSemana(ini);
    return {
      fecha_inicio: formatYmd(ini),
      fecha_fin: formatYmd(fin),
    };
  }, [fechaReferencia]);

  const cargar = useCallback(
    async (rangoParam?: RangoSemana) => {
      const r = rangoParam ?? rango;
      setLoading(true);
      try {
        const resp = await ProgramacionHorarioService.get_grilla_semanal(
          r.fecha_inicio,
          r.fecha_fin,
        );
        if (resp.success) {
          setProgramaciones(resp.data as RES_ProgramacionHorario[]);
        }
      } catch (err) {
        console.error(err);
        notifyError("No se pudo cargar la grilla semanal");
      } finally {
        setLoading(false);
      }
    },
    [rango, notifyError],
  );

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const irSemanaAnterior = () => {
    const nueva = new Date(fechaReferencia);
    nueva.setDate(nueva.getDate() - 7);
    setFechaReferencia(nueva);
  };

  const irSemanaSiguiente = () => {
    const nueva = new Date(fechaReferencia);
    nueva.setDate(nueva.getDate() + 7);
    setFechaReferencia(nueva);
  };

  const irSemanaActual = () => setFechaReferencia(new Date());

  const recargar = () => void cargar();

  return {
    rango,
    programaciones,
    loading,
    fechaReferencia,
    setFechaReferencia,
    irSemanaAnterior,
    irSemanaSiguiente,
    irSemanaActual,
    recargar,
  };
};