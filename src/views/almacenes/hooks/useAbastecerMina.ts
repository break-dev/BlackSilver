import { useState, useEffect, useMemo } from "react";
import { AlmacenesService } from "../service/almacenes.service";
import type { IMessage } from "../../../shared/enums/message";
import type {
  RES_MinaAbastecida,
  RES_MinaDisponible,
} from "../service/almacenes.responses";

export const useAbastecerMina = (id_almacen: number) => {
  const [minasDisponibles, setMinasDisponibles] = useState<
    RES_MinaDisponible[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<IMessage>({ type: "", content: "" });

  useEffect(() => {
    listarDisponibles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_almacen]);

  const listarDisponibles = async () => {
    setLoading(true);
    setMessage({ type: "", content: "" });
    try {
      const result = await AlmacenesService.get_minas(id_almacen);
      if (result.success) {
        setMinasDisponibles(result.data);
        if (result.data.length === 0) {
          setMessage({
            type: "info",
            content: "No se encontraron minas disponibles",
          });
        }
      } else {
        setMessage({
          type: "error",
          content: "Hubo un error al cargar las minas disponibles",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        content: "Hubo un error al cargar las minas disponibles",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const asignar = async (
    mina: RES_MinaDisponible,
  ): Promise<RES_MinaAbastecida | null> => {
    setMessage({ type: "", content: "" });
    try {
      const result = await AlmacenesService.nueva_mina_por_abastecer(
        id_almacen,
        mina.id_mina,
      );
      if (result.success) {
        setMessage({
          type: "success",
          content: result.message || "Se guardó correctamente",
        });
        return result.data;
      } else {
        setMessage({
          type: "error",
          content: result.message || "Hubo un error al abastecer la mina",
        });
        return null;
      }
    } catch (error) {
      setMessage({
        type: "error",
        content: "Hubo un error al intentar abastecer la mina",
      });
      console.error(error);
      return null;
    }
  };

  const selectOptions = useMemo(() => {
    const groups: Record<string, { value: string; label: string }[]> = {};
    minasDisponibles.forEach((m) => {
      const concesion = m.concesion || "Sin Concesión";
      if (!groups[concesion]) groups[concesion] = [];
      groups[concesion].push({ value: String(m.id_mina), label: m.nombre });
    });
    return Object.entries(groups).map(([concesion, items]) => ({
      group: concesion,
      items,
    }));
  }, [minasDisponibles]);

  return { minasDisponibles, loading, message, selectOptions, asignar };
};
