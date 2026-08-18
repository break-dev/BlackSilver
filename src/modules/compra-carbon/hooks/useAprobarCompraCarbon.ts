import { useState } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { CompraCarbonService } from "../service/compra-carbon.service";
import type { CompraCarbonDetalle } from "../service/compra-carbon.responses";

/**
 * Maneja la aprobacion de una compra de carbon: POST /aprobar,
 * manejo de loading/error y notificacion.
 */
export const useAprobarCompraCarbon = () => {
  const { notifyError, notifySuccess } = useNotify();
  const [loading, setLoading] = useState(false);

  const aprobar = async (
    idCompraCarbon: number,
  ): Promise<CompraCarbonDetalle | null> => {
    setLoading(true);
    try {
      const resp = await CompraCarbonService.aprobar(idCompraCarbon);
      if (!resp.success) {
        notifyError(resp.message || "No se pudo aprobar la compra");
        return null;
      }
      notifySuccess(resp.message || "Compra aprobada correctamente");
      return resp.data;
    } catch (e) {
      console.error(e);
      notifyError("Error al aprobar la compra de carbon");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { aprobar, loading };
};