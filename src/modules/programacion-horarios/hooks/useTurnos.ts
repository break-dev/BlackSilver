import { useCallback, useEffect, useState } from "react";
import { TurnoLaboralService } from "../service/turnos.service";
import type { RES_TurnoLaboral } from "../service/turnos.responses";
import { useNotify } from "../../../hooks/useNotify";

export const useTurnos = () => {
  const { notifyError } = useNotify();
  const [turnos, setTurnos] = useState<RES_TurnoLaboral[]>([]);
  const [loading, setLoading] = useState(false);

  const listar = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await TurnoLaboralService.get_turnos();
      if (resp.success) setTurnos(resp.data as RES_TurnoLaboral[]);
    } catch (err) {
      console.error(err);
      notifyError("No se pudieron cargar los turnos laborales");
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  useEffect(() => {
    void listar();
  }, [listar]);

  return { turnos, loading, recargar: listar };
};