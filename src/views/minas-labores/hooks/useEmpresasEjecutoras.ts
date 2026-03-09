import { useState, useEffect, useCallback } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { MinasService } from "../service/minas.service";
import type { RES_EmpresaEjecutora } from "../service/minas.responses";

interface Props {
  idMina: number;
}

export const useEmpresasEjecutoras = ({ idMina }: Props) => {
  const { notify } = useNotify();

  const [ejecutoras, setEjecutoras] = useState<RES_EmpresaEjecutora[]>([]);
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await MinasService.getEmpresasEjecutoras(idMina);
      if (res.success) setEjecutoras(res.data);
    } catch {
      notify({ type: "error", content: "Error al cargar las empresas" });
    } finally {
      setLoading(false);
    }
  }, [idMina, notify]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const handleEmpresaAsignada = (nueva: RES_EmpresaEjecutora) => {
    setEjecutoras((prev) => [...prev, nueva]);
    notify({ type: "success", content: "Empresa asignada correctamente" });
  };

  return {
    ejecutoras,
    loading,
    handleEmpresaAsignada,
  };
};
