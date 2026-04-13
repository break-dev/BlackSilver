import { useState, useEffect, useMemo, useCallback } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { AlmacenesService } from "../service/almacenes.service";
import type { RES_ResponsableAlmacen } from "../service/almacenes.responses";
import { EstadoBase } from "../../../shared/enums/estados";

export const useHistorialResponsables = (id_almacen: number) => {
  const { notify } = useNotify();
  const [responsables, setResponsables] = useState<RES_ResponsableAlmacen[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  const listar = useCallback(async () => {
    setLoading(true);
    try {
      const result =
        await AlmacenesService.get_historial_responsables(id_almacen);
      if (result.success) {
        setResponsables(result.data);
      } else {
        notify({ type: "error", content: result.message });
      }
    } catch (error) {
      notify({
        type: "error",
        content: "Error al cargar el historial de responsables",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id_almacen, notify]);

  useEffect(() => {
    listar();
  }, [listar]);

  const handleSuccess = (
    nuevo: RES_ResponsableAlmacen,
    onUpdateResponsable?: (nombre: string) => void,
  ) => {
    // Al agregar uno nuevo, el anterior(es) que estaba activo debe pasar a inactivo visualmente
    setResponsables((prev) => {
      const actualizados = prev.map((res) => {
        // Comparación segura usando el enum
        if (res.estado === EstadoBase.Activo) {
          return {
            ...res,
            estado: EstadoBase.Inactivo,
            fecha_fin: nuevo.fecha_inicio, // Se asume que termina cuando empieza el nuevo
          };
        }
        return res;
      });
      return [nuevo, ...actualizados];
    });

    if (onUpdateResponsable) onUpdateResponsable(nuevo.nombre_completo);
  };

  const responsablesOrdenados = useMemo(() => {
    return [...responsables].sort((a, b) => {
      const diff =
        new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime();
      return diff !== 0
        ? diff
        : b.id_responsable_almacen - a.id_responsable_almacen;
    });
  }, [responsables]);

  return {
    responsables: responsablesOrdenados,
    loading,
    handleSuccess,
  };
};
