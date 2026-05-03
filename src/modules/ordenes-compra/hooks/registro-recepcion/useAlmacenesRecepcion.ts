import { useState, useEffect } from "react";
import type { RES_Almacen } from "../../../../service/responses/almacen";
import { OrdenCompraService } from "../../service/orden-compra.service";

export const useAlmacenesRecepcion = () => {
  const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(true);
  const [selectedAlmacenId, setSelectedAlmacenId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    OrdenCompraService.getAlmacenes()
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
