import { useState, useEffect, useCallback, useMemo } from "react";
import { useNotify } from "../../../../hooks/useNotify";
import { MinasService } from "../../service/minas.service";
import type { RES_HistorialResponsable } from "../../service/minas.responses";
import { EstadoBase } from "../../../../shared/enums/_generic/estado-base";
import dayjs from "dayjs";

interface Props {
  idMina: number;
  onResponsableAsignado?: (nombreResponsable: string) => void;
  onResponsableInactivado?: (nombreResponsable: string) => void;
}

export const useResponsablesMina = ({
  idMina,
  onResponsableAsignado,
  onResponsableInactivado,
}: Props) => {
  const { notify } = useNotify();

  const [historial, setHistorial] = useState<RES_HistorialResponsable[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInactivando, setLoadingInactivando] = useState<number | null>(
    null,
  );

  const historialOrdenado = useMemo(() => {
    return [...historial].sort((a, b) => {
      const aAtivo = a.estado?.toUpperCase() === "ACTIVO" ? 1 : 0;
      const bAtivo = b.estado?.toUpperCase() === "ACTIVO" ? 1 : 0;

      if (aAtivo !== bAtivo) {
        return bAtivo - aAtivo; // Activos primero
      }

      // Desempate por fecha de inicio descendente
      return dayjs(b.fecha_inicio).unix() - dayjs(a.fecha_inicio).unix();
    });
  }, [historial]);

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
    setHistorial((prev) => [nueva, ...prev]);

    onResponsableAsignado?.(nueva.nombre_completo);
    notify({
      type: "success",
      content: "Responsable asignado correctamente",
    });
  };

  const handleInactivarResponsable = async (
    id_responsable_mina: number,
    fecha_fin: string,
  ): Promise<boolean> => {
    const item = historial.find((h) => h.id_responsable_mina === id_responsable_mina);
    if (!item) return false;

    setLoadingInactivando(id_responsable_mina);
    try {
      const res = await MinasService.inactivarResponsable(
        id_responsable_mina,
        fecha_fin,
      );
      if (res.success) {
        setHistorial((prev) =>
          prev.map((it) =>
            it.id_responsable_mina === id_responsable_mina
              ? { ...it, estado: EstadoBase.Inactivo, fecha_fin }
              : it,
          ),
        );
        
        onResponsableInactivado?.(item.nombre_completo);

        notify({
          type: "success",
          content: "Responsable inactivado correctamente",
        });
        return true;
      }
      return false;
    } catch {
      notify({ type: "error", content: "Error al inactivar el responsable" });
      return false;
    } finally {
      setLoadingInactivando(null);
    }
  };

  return {
    historial: historialOrdenado,
    loading,
    loadingInactivando,
    handleResponsableAsignado,
    handleInactivarResponsable,
  };
};
