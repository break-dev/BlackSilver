import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Schema_FiltrosAsistencia, type DTO_FiltrosAsistencia } from "../service/asistencia.requests";

type FiltrosForm = {
  mes: string;
  year: string;
  q: string;
  idEmpleado: string | null;
};

/**
 * Hook para los filtros de la vista admin de Asistencia (estilo Kardex).
 *
 * Mantiene mes/año/q como strings para encajar con los inputs de Mantine.
 * Expone `filtrosPayload` listo para enviar al backend.
 */
export const useFiltrosAsistencia = () => {
  const [mes, setMes] = useState<string>(String(dayjs().month() + 1));
  const [year, setYear] = useState<string>(String(dayjs().year()));
  const [q, setQ] = useState("");
  const [idEmpleado, setIdEmpleado] = useState<string | null>(null);

  const filtrosPayload = useMemo<DTO_FiltrosAsistencia>(() => {
    return Schema_FiltrosAsistencia.parse({
      mes,
      year,
      q,
      id_empleado: idEmpleado,
    });
  }, [mes, year, q, idEmpleado]);

  const limpiarFiltros = useCallback(() => {
    setQ("");
    setIdEmpleado(null);
  }, []);

  return {
    mes,
    setMes,
    year,
    setYear,
    q,
    setQ,
    idEmpleado,
    setIdEmpleado,
    filtrosPayload,
    limpiarFiltros,
  };
};

export type { FiltrosForm };