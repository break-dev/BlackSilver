import { useState, useEffect } from "react";
import type { RES_Almacen } from "../../../../service/responses/almacen";
import { AuxService } from "../../../../service/auxiliar.service";

import { useAuthStore } from "../../../../stores/auth.store";

export const useAlmacenesRecepcion = (soloAutorizados: boolean = true) => {
  const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(true);
  const [selectedAlmacenId, setSelectedAlmacenId] = useState<number | null>(
    null,
  );
  const [prevSoloAutorizados, setPrevSoloAutorizados] =
    useState(soloAutorizados);

  if (soloAutorizados !== prevSoloAutorizados) {
    setPrevSoloAutorizados(soloAutorizados);
    setLoadingAlmacenes(true);
    setSelectedAlmacenId(null);
  }

  useEffect(() => {
    const id_empleado = useAuthStore.getState().usuario?.id_empleado;

    AuxService.get_almacenes({
      ...(soloAutorizados &&
        id_empleado && { id_empleado_responsable: id_empleado }),
    })
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setAlmacenes(res.data);
          setSelectedAlmacenId(res.data[0].id_almacen);
        } else {
          setAlmacenes([]);
          setSelectedAlmacenId(null);
        }
      })
      .finally(() => setLoadingAlmacenes(false));
  }, [soloAutorizados]);

  return {
    almacenes,
    loadingAlmacenes,
    selectedAlmacenId,
    setSelectedAlmacenId,
  };
};
