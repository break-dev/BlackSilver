import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { useNotify } from "../../../hooks/useNotify";
import type { RES_Almacen } from "../../../service/responses/almacen";
import { OCTransService } from "../service/oc-recepcion-transferencias.service";
import type {
  RES_OCTransferencia,
  RES_OCTransferenciaDetalle,
} from "../../../service/responses/ordenes-compra/orden-compra-transferencia";
import { AuxService } from "../../../service/aux.service";
import { useAuditoriaStore } from "../../../stores/auditoria.store";
import { useMemo } from "react";

export const useListarTransferencias = () => {
  const { en_modo_auditable } = useAuditoriaStore();
  const { notifyError } = useNotify();

  const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
  const [selectedAlmacenId, setSelectedAlmacenId] = useState<number | null>(
    null,
  );
  const [mes, setMes] = useState<number>(dayjs().month() + 1); // dayjs months 0-indexed
  const [anio, setAnio] = useState<number>(dayjs().year());

  const [transferencias, setTransferencias] = useState<RES_OCTransferencia[]>(
    [],
  );
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(true);
  const [loading, setLoading] = useState(false);

  // Detalles de la transferencia seleccionada
  const [selectedTransferencia, setSelectedTransferencia] =
    useState<RES_OCTransferencia | null>(null);
  const [detallesTransferencia, setDetallesTransferencia] = useState<
    RES_OCTransferenciaDetalle[]
  >([]);
  const [loadingDetalles, setLoadingDetalles] = useState(false);

  // 1. Cargar almacenes al montar — autoelige el primero
  useEffect(() => {
    AuxService.get_almacenes()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setAlmacenes(res.data);
          setSelectedAlmacenId(res.data[0].id_almacen);
        }
      })
      .catch(() => notifyError("Error al cargar almacenes."))
      .finally(() => setLoadingAlmacenes(false));
  }, [notifyError]);

  // 2. Cargar transferencias cuando cambian los filtros
  const cargarTransferencias = useCallback(async () => {
    if (!selectedAlmacenId) return;

    // Diferimos el setLoading para evitar el error de "cascading renders" en el useEffect
    await Promise.resolve();
    setLoading(true);

    try {
      const res = await OCTransService.getTransferencias(
        selectedAlmacenId,
        mes,
        anio,
      );
      if (res.success && res.data) {
        setTransferencias(res.data);
      } else {
        setTransferencias([]);
      }
    } catch {
      notifyError("Error al cargar transferencias.");
    } finally {
      setLoading(false);
    }
  }, [selectedAlmacenId, mes, anio, notifyError]);

  useEffect(() => {
    cargarTransferencias();
  }, [cargarTransferencias]);

  // 3. Cargar detalles al seleccionar una transferencia
  const seleccionarTransferencia = (t: RES_OCTransferencia) => {
    setSelectedTransferencia(t);
    setDetallesTransferencia([]);
    setLoadingDetalles(true);
    OCTransService.getDetallesTransferencia(t.id_transferencia)
      .then((res) => {
        if (res.success && res.data) {
          setDetallesTransferencia(res.data);
        }
      })
      .catch(() => notifyError("Error al cargar detalles."))
      .finally(() => setLoadingDetalles(false));
  };

  const cerrarDetalle = () => {
    setSelectedTransferencia(null);
    setDetallesTransferencia([]);
  };

  const refrescarLista = useCallback(() => {
    cargarTransferencias();
  }, [cargarTransferencias]);

  const transferenciasFiltradas = useMemo(() => {
    return transferencias.filter((t) => !(en_modo_auditable && t.es_auditable));
  }, [transferencias, en_modo_auditable]);

  return {
    almacenes,
    selectedAlmacenId,
    setSelectedAlmacenId,
    mes,
    setMes,
    anio,
    setAnio,
    transferencias: transferenciasFiltradas,
    loading,
    loadingAlmacenes,
    selectedTransferencia,
    detallesTransferencia: detallesTransferencia,
    loadingDetalles,
    seleccionarTransferencia,
    cerrarDetalle,
    refrescarLista,
  };
};
