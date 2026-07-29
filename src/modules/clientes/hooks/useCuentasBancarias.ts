import { useState, useEffect } from "react";
import { AuxService } from "../../../service/auxiliar.service";
import type { CuentaBancariaResponse } from "../service/clientes.responses";
import type { RES_Banco } from "../../../service/responses/banco";

export const useCuentasBancarias = (idCliente: number | null) => {
  const [bancos, setBancos] = useState<RES_Banco[]>([]);
  const [loadingBancos, setLoadingBancos] = useState(false);

  const fetchBancos = async () => {
    if (loadingBancos || bancos.length > 0) return;
    setLoadingBancos(true);
    try {
      const data = await AuxService.get_bancos();
      if (data.success) {
        setBancos(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBancos(false);
    }
  };

  useEffect(() => {
    if (idCliente) {
      fetchBancos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCliente]);

  return {
    bancos,
    setBancos,
    loadingBancos,
    fetchBancos,
  };
};

export type { CuentaBancariaResponse };
