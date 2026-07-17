import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Schema_FiltrosPlanilla, type DTO_FiltrosPlanilla } from "../service/planilla.requests";

type FiltrosPlanillaForm = {
  mes: string;
  year: string;
  q: string;
  idEmpleado: string | null;
};

/**
 * Hook para los filtros de la vista de Planilla.
 */
export const useFiltrosPlanilla = () => {
  const [mes, setMes] = useState<string>(String(dayjs().month() + 1));
  const [year, setYear] = useState<string>(String(dayjs().year()));
  const [q, setQ] = useState("");
  const [idEmpleado, setIdEmpleado] = useState<string | null>(null);

  const filtrosPayload = useMemo<DTO_FiltrosPlanilla>(() => {
    return Schema_FiltrosPlanilla.parse({
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

export type { FiltrosPlanillaForm };
