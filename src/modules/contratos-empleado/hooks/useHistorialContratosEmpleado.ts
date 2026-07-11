import { useState, useCallback, useEffect } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { ContratosEmpleadoService } from "../service/contratos-empleado.service";
import type { RES_ContratoEmpleado } from "../../../service/responses/contrato-empleado";
import { EstadoContrato } from "../../../shared/enums/contrato/estado-contrato";

export const useHistorialContratosEmpleado = (idEmpleado: number | null) => {
  const [contratos, setContratos] = useState<RES_ContratoEmpleado[]>([]);
  const [loading, setLoading] = useState(false);
  const { notifyError } = useNotify();

  const fetch = useCallback(async () => {
    if (!idEmpleado) {
      setContratos([]);
      return;
    }
    setLoading(true);
    try {
      const resp = await ContratosEmpleadoService.get_historial_por_empleado(
        idEmpleado,
      );
      if (resp.success) setContratos(resp.data);
    } catch (err) {
      console.error(err);
      notifyError("Error al cargar el historial de contratos");
    } finally {
      setLoading(false);
    }
  }, [idEmpleado, notifyError]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    contratos,
    loading,
    reload: fetch,
    pushContrato: (contrato: RES_ContratoEmpleado) =>
      setContratos((prev) => [contrato, ...prev]),
    /**
     * Devuelve el contrato más reciente del historial.
     * Si existe un contrato Vigente, devuelve ese.
     * Si no, devuelve el más reciente sin importar el estado.
     * Si no hay contratos, devuelve null.
     */
    getUltimoContrato: (): RES_ContratoEmpleado | null => {
      if (contratos.length === 0) return null;
      const vigente = contratos.find((c) => c.estado === EstadoContrato.Vigente);
      if (vigente) return vigente;
      return contratos[0] ?? null;
    },
  };
};
