import { useState, useCallback } from "react";
import { useNotify } from "../../../hooks/useNotify";
import type { RES_OCTransRecepcion } from "../../../service/responses/ordenes-compra/orden-compra-transferencia-recepcion";
import { OCTransService } from "../service/oc-recepcion-transferencias.service";

export const useListarRecepciones = () => {
  const { notifyError } = useNotify();
  const [recepciones, setRecepciones] = useState<RES_OCTransRecepcion[]>([]);
  const [loading, setLoading] = useState(false);

  const cargarRecepciones = useCallback(
    (idTransferencia: number) => {
      setLoading(true);
      setRecepciones([]);
      OCTransService.getHistorialRecepciones(idTransferencia)
        .then((res) => {
          if (res.success && res.data) setRecepciones(res.data);
        })
        .catch(() =>
          notifyError("Error al cargar el historial de recepciones."),
        )
        .finally(() => setLoading(false));
    },
    [notifyError],
  );

  return { recepciones, loading, cargarRecepciones };
};
