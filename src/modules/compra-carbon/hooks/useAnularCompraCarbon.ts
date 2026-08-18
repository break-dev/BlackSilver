import { useState } from "react";
import { CompraCarbonService } from "../service/compra-carbon.service";
import { useNotify } from "../../../hooks/useNotify";
import type { CompraCarbonDetalle } from "../service/compra-carbon.responses";

/**
 * Maneja la anulacion de una compra de carbon.
 */
export const useAnularCompraCarbon = () => {
  const { notifyError, notifySuccess } = useNotify();
  const [loading, setLoading] = useState(false);

  const anular = async (
    idCompraCarbon: number,
  ): Promise<CompraCarbonDetalle | null> => {
    setLoading(true);
    try {
      const resp = await CompraCarbonService.anular(idCompraCarbon);
      if (!resp.success) {
        notifyError(resp.message || "No se pudo anular la compra");
        return null;
      }
      notifySuccess(resp.message || "Compra anulada correctamente");
      return resp.data;
    } catch (e) {
      console.error(e);
      notifyError("Error al anular la compra de carbon");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { anular, loading };
};