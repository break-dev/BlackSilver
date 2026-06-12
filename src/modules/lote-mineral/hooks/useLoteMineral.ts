import { useState, useEffect, useCallback } from 'react';
import { loteMineralService } from '../service/lote-mineral.service';
import type { RegistrarLoteMineralRequest } from '../service/lote-mineral.requests';
import type { LoteMineral } from '../service/lote-mineral.responses';
import type { IRespuesta } from '../../../shared/interfaces/_response';
import { useNotify } from '../../../hooks/useNotify';

export const useLotesMineral = (mes?: number, anio?: number) => {
  const [data, setData] = useState<IRespuesta<LoteMineral[]> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await loteMineralService.getLotes({ mes, anio });
      if (response.success) {
        setData(response);
      } else {
        setData({ success: false, data: [], message: 'Error' });
      }
    } catch (error) {
      console.error(error);
      setData({ success: false, data: [], message: 'Error' });
    } finally {
      setIsLoading(false);
    }
  }, [mes, anio]);

  const addLote = useCallback((newLote: LoteMineral) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        data: [newLote, ...prev.data],
      };
    });
  }, []);

  useEffect(() => {
    fetchLotes();
  }, [fetchLotes]);

  return { data, isLoading, refetch: fetchLotes, addLote };
};

export const useRegistrarLoteMineral = () => {
  const { notifySuccess, notifyError } = useNotify();
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    request: RegistrarLoteMineralRequest,
    options?: { onSuccess?: (data: LoteMineral) => void }
  ) => {
    setIsPending(true);
    try {
      const response = await loteMineralService.registrarLote(request);
      if (response.success && response.data) {
        notifySuccess(response.message || 'Lote registrado correctamente');
        if (options?.onSuccess) {
          options.onSuccess(response.data);
        }
      } else {
        notifyError(response.message || 'Ocurrió un error al registrar el lote');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      notifyError(err?.response?.data?.message || 'Error de conexión');
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
};
