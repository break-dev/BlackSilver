import { useState, useEffect } from "react";
import { ProveedoresService } from "../service/proveedores.service";
import type { RES_Banco } from "../../../service/responses/banco";

export const useCuentasBancarias = (idProveedor: number | null) => {
  const [bancos, setBancos] = useState<RES_Banco[]>([]);
  const [loadingBancos, setLoadingBancos] = useState(false);

  const fetchBancos = async () => {
    if (loadingBancos || bancos.length > 0) return;
    setLoadingBancos(true);
    try {
      const data = await ProveedoresService.getBancos();
      setBancos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBancos(false);
    }
  };

  useEffect(() => {
    if (idProveedor) {
      fetchBancos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idProveedor]);

  return {
    bancos,
    setBancos,
    loadingBancos,
    fetchBancos,
  };
};
