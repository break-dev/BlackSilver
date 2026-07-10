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
  // Filtros por lugar. "" = sin filtro, "almacen"/"labor" = tipo seleccionado.
  const [tipoLugarFiltro, setTipoLugarFiltro] = useState<"" | "almacen" | "labor">("");
  const [idLugarFiltro, setIdLugarFiltro] = useState<number | null>(null);

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
      if (tipoLugarFiltro !== "" && idLugarFiltro === null) {
        setProgramaciones([]);
        return;
      }
      const r = rangoParam ?? rango;
      setLoading(true);
      try {
        const filtros: {
          id_almacen?: number | null;
          id_labor?: number | null;
          id_oficina?: number | null;
        } = {};
        if (tipoLugarFiltro === "almacen" && idLugarFiltro !== null) {
          filtros.id_almacen = idLugarFiltro;
        } else if (tipoLugarFiltro === "labor" && idLugarFiltro !== null) {
          filtros.id_labor = idLugarFiltro;
        }
        const resp = await ProgramacionHorarioService.get_grilla_semanal(
          r.fecha_inicio,
          r.fecha_fin,
          filtros,
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
    [rango, notifyError, tipoLugarFiltro, idLugarFiltro],
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

  const setTipoLugarYFiltro = (
    tipo: "" | "almacen" | "labor",
    id: number | null,
  ) => {
    setTipoLugarFiltro(tipo);
    setIdLugarFiltro(id);
  };

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
    tipoLugarFiltro,
    idLugarFiltro,
    setTipoLugarYFiltro,
  };
};