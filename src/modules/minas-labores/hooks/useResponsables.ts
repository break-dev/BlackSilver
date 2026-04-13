import { useState, useEffect, useCallback } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { MinasService } from "../service/minas.service";
import type { RES_HistorialResponsable } from "../service/minas.responses";

import { EstadoBase } from "../../../shared/enums/estados";

interface Props {
  idMina: number;
  onResponsableAsignado?: (nombreResponsable: string) => void;
}

export const useResponsablesMina = ({
  idMina,
  onResponsableAsignado,
}: Props) => {
  const { notify } = useNotify();

  const [historial, setHistorial] = useState<RES_HistorialResponsable[]>([]);
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await MinasService.getHistorialResponsables(idMina);
      if (res.success) setHistorial(res.data);
    } catch {
      notify({ type: "error", content: "Error al cargar los responsables" });
    } finally {
      setLoading(false);
    }
  }, [idMina, notify]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const handleResponsableAsignado = (nueva: RES_HistorialResponsable) => {
    setHistorial((prev) => {
      const actualizados = prev.map((res) => {
        if (res.estado?.toUpperCase() === "ACTIVO") {
          return {
            ...res,
            estado: EstadoBase.Inactivo,
            fecha_fin: nueva.fecha_inicio,
          };
        }
        return res;
      });
      return [nueva, ...actualizados];
    });

    onResponsableAsignado?.(nueva.empleado);
    notify({
      type: "success",
      content: "Responsable asignado correctamente",
    });
  };

  return {
    historial,
    loading,
    handleResponsableAsignado,
  };
};
