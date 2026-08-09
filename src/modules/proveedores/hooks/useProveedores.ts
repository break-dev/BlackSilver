import { useState, useEffect } from "react";
import { ProveedoresService } from "../service/proveedores.service";
import type {
  CuentaBancariaResponse,
  ProveedorResponse,
} from "../service/proveedores.responses";
import { useNotify } from "../../../hooks/useNotify";

export const useProveedores = () => {
  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const { notifyError } = useNotify();

  const fetchProveedores = async () => {
    setLoading(true);
    try {
      const data = await ProveedoresService.getProveedores();
      setProveedores(data);
    } catch (e) {
      console.error(e);
      notifyError("Ocurrió un error al cargar los proveedores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const insertProveedor = (p: ProveedorResponse) => {
    setProveedores((prev) => [p, ...prev]);
  };

  const updateProveedor = (id: number, cambios: Partial<ProveedorResponse>) => {
    setProveedores((prev) =>
      prev.map((p) => (p.id_proveedor === id ? { ...p, ...cambios } : p)),
    );
  };

  const updateCuentaEnProveedor = (cuenta: CuentaBancariaResponse) => {
    setProveedores((prev) =>
      prev.map((p) => {
        const cuentas = p.cuentas_bancarias ?? [];
        const existe = cuentas.some(
          (c) => c.id_cuenta_bancaria === cuenta.id_cuenta_bancaria,
        );
        const nuevasCuentas = existe
          ? cuentas.map((c) =>
              c.id_cuenta_bancaria === cuenta.id_cuenta_bancaria ? cuenta : c,
            )
          : [cuenta, ...cuentas];
        return {
          ...p,
          cuentas_bancarias: nuevasCuentas,
          cantidad_cuentas_bancarias: nuevasCuentas.length,
        };
      }),
    );
  };

  return {
    proveedores,
    loading,
    fetchProveedores,
    insertProveedor,
    updateProveedor,
    updateCuentaEnProveedor,
    recargar: fetchProveedores,
  };
};
