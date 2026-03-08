import { useState, useEffect, useMemo } from "react";
import { notifications } from "@mantine/notifications";
import type { IMessage } from "../../../shared/interfaces";
import type { RES_Almacen } from "../service/almacenes.responses";
import { AlmacenesService } from "../service/almacenes.service";

export const useAlmacenes = () => {
  const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<IMessage>({ type: "", content: "" });

  // Búsqueda
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    listar();
  }, []);

  // Único punto de notificaciones
  useEffect(() => {
    if (!message.type || !message.content) return;
    const colorMap: Record<string, string> = {
      success: "green",
      error: "red",
      info: "blue",
    };
    const titleMap: Record<string, string> = {
      success: "Éxito",
      error: "Error",
      info: "Información",
    };
    notifications.show({
      title: titleMap[message.type] ?? "",
      message: message.content,
      color: colorMap[message.type] ?? "gray",
    });
  }, [message]);

  const handleChildMessage = (msg: IMessage) => {
    if (!msg.type) return;
    setMessage({ ...msg });
  };

  const listar = async () => {
    setLoading(true);
    setMessage({ type: "", content: "" });
    try {
      const result = await AlmacenesService.get_almacenes();
      if (result.success) {
        setAlmacenes(result.data);
      } else {
        setMessage({ type: "error", content: result.message });
      }
    } catch (error) {
      setMessage({ type: "error", content: "Error al cargar los almacenes" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const almacenesFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return almacenes.filter(
      (alm) =>
        !q ||
        alm.nombre.toLowerCase().includes(q) ||
        (alm.responsable_actual || "").toLowerCase().includes(q),
    );
  }, [almacenes, busqueda]);

  return {
    almacenes,
    loading,
    message,
    setAlmacenes,
    handleChildMessage,
    busqueda,
    setBusqueda,
    almacenesFiltrados,
  };
};
