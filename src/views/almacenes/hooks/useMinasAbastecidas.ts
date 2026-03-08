import { useState, useEffect } from "react";
import { AlmacenesService } from "../service/almacenes.service";
import type { IMessage } from "../../../shared/interfaces";
import type { RES_MinaAbastecida } from "../service/almacenes.responses";

export const useMinasAbastecidas = (id_almacen: number) => {
  const [minas, setMinas] = useState<RES_MinaAbastecida[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<IMessage>({ type: "", content: "" });

  useEffect(() => {
    listar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_almacen]);

  const listar = async () => {
    setLoading(true);
    setMessage({ type: "", content: "" });
    try {
      const result = await AlmacenesService.get_minas_abastecidas(id_almacen);
      if (result.success) {
        setMinas(result.data);
      } else {
        setMessage({ type: "error", content: result.message });
      }
    } catch (error) {
      setMessage({
        type: "error",
        content: "Error al cargar las minas abastecidas",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const desasignar = async (id_almacen_mina: number): Promise<boolean> => {
    setMessage({ type: "", content: "" });
    try {
      const result =
        await AlmacenesService.eliminar_abastecimiento_mina(id_almacen_mina);
      if (result.success) {
        setMinas((prev) =>
          prev.filter((m) => m.id_almacen_mina !== id_almacen_mina),
        );
        setMessage({ type: "success", content: result.message });
        return true;
      } else {
        setMessage({ type: "error", content: result.message });
        return false;
      }
    } catch (error) {
      setMessage({ type: "error", content: "Error al desvincular la mina" });
      console.error(error);
      return false;
    }
  };

  const agregar = (nuevaMina: RES_MinaAbastecida) => {
    setMinas((prev) => {
      const exists = prev.some(
        (m) => m.id_almacen_mina === nuevaMina.id_almacen_mina,
      );
      if (exists) return prev;
      return [...prev, nuevaMina].sort((a, b) =>
        a.nombre.localeCompare(b.nombre),
      );
    });
  };

  return { minas, loading, message, desasignar, agregar };
};
