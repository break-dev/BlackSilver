import { useState, useEffect } from "react";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_Almacen } from "../../../service/responses/almacen";
import type { RES_Mina } from "../../../service/responses/mina";
import type { RES_Labor } from "../../../service/responses/labor";
import { ActivosService } from "../service/activos.service";
import type { REQ_ActualizarActivo } from "../service/activos.requests";
import type { RES_ActivoFijoResumen } from "../service/activos.responses";
import { useNotify } from "../../../hooks/useNotify";

/**
 * Hook para la edición de un activo fijo existente.
 * Maneja la carga de catálogos necesarios (almacenes, minas, labores)
 * y el envío del PUT /activos-fijos/{id}.
 *
 * Separado de useRegistrarActivo a propósito: el alcance de campos es
 * distinto (no hay producto, marca, empleado, costo, factura, etc.) y la
 * lógica de ubicación parte desde el estado actual del activo.
 */
export const useEditarActivo = () => {
  const { notifySuccess, notifyError } = useNotify();

  const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
  const [minas, setMinas] = useState<RES_Mina[]>([]);
  const [labores, setLabores] = useState<RES_Labor[]>([]);

  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);
  const [loadingMinas, setLoadingMinas] = useState(false);
  const [loadingLabores, setLoadingLabores] = useState(false);

  useEffect(() => {
    const loadAlmacenes = async () => {
      setLoadingAlmacenes(true);
      try {
        const res = await AuxService.get_almacenes();
        if (res.success) setAlmacenes(res.data);
      } catch (e) {
        console.error("Error al cargar almacenes", e);
      } finally {
        setLoadingAlmacenes(false);
      }
    };

    const loadMinas = async () => {
      setLoadingMinas(true);
      try {
        const res = await AuxService.get_minas();
        if (res.success) setMinas(res.data);
      } catch (e) {
        console.error("Error al cargar minas", e);
      } finally {
        setLoadingMinas(false);
      }
    };

    const loadLabores = async () => {
      setLoadingLabores(true);
      try {
        const res = await AuxService.get_labores();
        if (res.success) setLabores(res.data);
      } catch (e) {
        console.error("Error al cargar labores", e);
      } finally {
        setLoadingLabores(false);
      }
    };

    loadAlmacenes();
    loadMinas();
    loadLabores();
  }, []);

  /**
   * Labores filtradas por mina para el select de labor.
   */
  const getLaboresPorMina = (
    idMina: number | null | undefined,
  ): RES_Labor[] => {
    if (!idMina) return [];
    return labores.filter((l) => l.id_mina === idMina);
  };

  const actualizarActivo = async (
    id_activo: number,
    payload: REQ_ActualizarActivo,
  ): Promise<RES_ActivoFijoResumen | null> => {
    try {
      const res = await ActivosService.actualizarActivo(id_activo, payload);
      if (res.success) {
        notifySuccess("Activo actualizado correctamente");
        return res.data;
      }
      notifyError(res.message);
    } catch (e) {
      console.error("Error al actualizar activo", e);
      notifyError("Error al actualizar activo");
    }
    return null;
  };

  return {
    almacenes,
    minas,
    labores,
    loadingAlmacenes,
    loadingMinas,
    loadingLabores,
    getLaboresPorMina,
    actualizarActivo,
  };
};
