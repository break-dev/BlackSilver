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
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const insertCliente = (nuevoCliente: ClienteResponse) => {
    setClientes((prev) => [...prev, nuevoCliente]);
  };

  return { clientes, loading, fetchClientes, insertCliente };
};
