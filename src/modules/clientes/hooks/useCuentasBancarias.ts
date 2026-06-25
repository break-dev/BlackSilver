import { useState, useEffect } from "react";
import { ClientesService } from "../service/clientes.service";
import { AuxService } from "../../../service/auxiliar.service";
import type { CuentaBancariaResponse } from "../service/clientes.responses";
import type { RES_Banco } from "../../../service/responses/banco";
import { useNotify } from "../../../hooks/useNotify";

export const useCuentasBancarias = (idCliente: number | null) => {
  const [cuentas, setCuentas] = useState<CuentaBancariaResponse[]>([]);
  const [bancos, setBancos] = useState<RES_Banco[]>([]);
  const [loadingCuentas, setLoadingCuentas] = useState(false);
  const [loadingBancos, setLoadingBancos] = useState(false);
  const { notifyError } = useNotify();

  const fetchCuentas = async (id: number) => {
    if (!id) return;
    setLoadingCuentas(true);
    try {
      const data = await ClientesService.getCuentasBancarias(id);
      setCuentas(data);
    } catch (e) {
      console.error(e);
      notifyError("Error al cargar cuentas bancarias");
    } finally {
      setLoadingCuentas(false);
    }
  };

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
      fetchCuentas(idCliente);
      fetchBancos();
    } else {
      setCuentas([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCliente]);

  return {
    cuentas,
    bancos,
    setBancos,
    loadingCuentas,
    loadingBancos,
    fetchBancos,
    insertCuenta: (c: CuentaBancariaResponse) => {
      setCuentas((prev) => [c, ...prev]);
    },
    reloadCuentas: () => {
      if (idCliente) fetchCuentas(idCliente);
    },
  };
};
