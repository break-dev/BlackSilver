import { useState, useCallback, useEffect } from "react";
import { ClientesService } from "../service/clientes.service";
import type { ClienteResponse } from "../service/clientes.responses";
import { useNotify } from "../../../hooks/useNotify";

export const useClientes = () => {
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const { notifyError } = useNotify();

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ClientesService.getClientes();
      setClientes(res);
    } catch (error) {
      console.error(error);
      notifyError("Ocurrió un error al cargar los clientes");
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const insertCliente = (nuevoCliente: ClienteResponse) => {
    setClientes((prev) => [...prev, nuevoCliente]);
  };

  const updateCliente = (clienteActualizado: ClienteResponse) => {
    setClientes((prev) =>
      prev.map((c) => {
        if (c.id_cliente !== clienteActualizado.id_cliente) return c;

        const cuentas =
          clienteActualizado.cuentas_bancarias ?? c.cuentas_bancarias ?? [];
        const cantidadConsistente =
          clienteActualizado.cantidad_cuentas_bancarias ?? cuentas.length;

        return {
          ...clienteActualizado,
          cuentas_bancarias: cuentas,
          cantidad_cuentas_bancarias: cantidadConsistente,
        };
      })
    );
  };

  return {
    clientes,
    loading,
    fetchClientes,
    insertCliente,
    updateCliente,
  };
};