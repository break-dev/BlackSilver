import { useState, useEffect } from "react";
import type { RES_Almacen } from "../../../../service/responses/almacen";
import { AuxService } from "../../../../service/aux.service";

export const useAlmacenesRecepcion = () => {
  const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(true);
  const [selectedAlmacenId, setSelectedAlmacenId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    AuxService.get_almacenes()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setAlmacenes(res.data);
          setSelectedAlmacenId(res.data[0].id_almacen);
        }
      })
      .finally(() => setLoadingAlmacenes(false));
  }, []);

  return {
    almacenes,
    loadingAlmacenes,
    selectedAlmacenId,
    setSelectedAlmacenId,
  };
};
