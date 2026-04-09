import { useState, useEffect } from "react";
import { ProveedoresService } from "../service/proveedores.service";
import type {
  BancoResponse,
  CuentaBancariaResponse,
} from "../service/proveedores.responses";
import { useNotify } from "../../../hooks/useNotify";

export const useCuentasBancarias = (idProveedor: number | null) => {
  const [cuentas, setCuentas] = useState<CuentaBancariaResponse[]>([]);
  const [bancos, setBancos] = useState<BancoResponse[]>([]);
  const [loadingCuentas, setLoadingCuentas] = useState(false);
  const [loadingBancos, setLoadingBancos] = useState(false);
  const { notifyError } = useNotify();

  const fetchCuentas = async (id: number) => {
    if (!id) return;
    setLoadingCuentas(true);
    try {
      const data = await ProveedoresService.getCuentasBancarias(id);
      setCuentas(data);
    } catch (e) {
      console.error(e);
      notifyError("Error al cargar cuentas bancarias");
    } finally {
      setLoadingCuentas(false);
    }
  };

  const fetchBancos = async () => {
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
    fetchBancos();
  }, []);

  useEffect(() => {
    if (idProveedor) {
      fetchCuentas(idProveedor);
    } else {
      setCuentas([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idProveedor]);

  return {
    cuentas,
    bancos,
    setBancos,
    loadingCuentas,
    loadingBancos,
    reloadCuentas: () => {
      if (idProveedor) fetchCuentas(idProveedor);
    },
  };
};
