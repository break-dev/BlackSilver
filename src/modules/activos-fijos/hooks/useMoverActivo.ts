import { useState, useEffect } from "react";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_Almacen } from "../../../service/responses/almacen";
import type { RES_Mina } from "../../../service/responses/mina";
import { ActivosService } from "../service/activos.service";
import type { REQ_ActualizarUbicacion } from "../service/activos.requests";
import { useNotify } from "../../../hooks/useNotify";

export const useMoverActivo = () => {
  const { notifySuccess, notifyError } = useNotify();

  const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
  const [minas, setMinas] = useState<RES_Mina[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [resA, resM] = await Promise.all([
          AuxService.get_almacenes(),
          AuxService.get_minas(),
        ]);
        if (resA.success) setAlmacenes(resA.data);
        if (resM.success) setMinas(resM.data);
      } catch (error) {
        console.error("Error al cargar ubicaciones", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const actualizarUbicacion = async (payload: REQ_ActualizarUbicacion) => {
    try {
      const res = await ActivosService.actualizarUbicacion(payload);
      if (res.success) {
        notifySuccess("Ubicación actualizada correctamente");
        return true;
      }
      notifyError(res.message);
    } catch (error) {
      console.error("Error al actualizar ubicación", error);
      notifyError("Error al actualizar ubicación");
    }
    return false;
  };

  return {
    almacenes,
    minas,
    loading,
    actualizarUbicacion,
  };
};
