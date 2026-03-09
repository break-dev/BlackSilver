import { useState, useEffect, useCallback } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { MinasService } from "../service/minas.service";
import type {
  RES_EmpresaDisponible,
  RES_EmpresaEjecutora,
} from "../service/minas.responses";

interface Props {
  idMina: number;
  idConcesion: number;
}

export const useGestionEmpresasMina = ({ idMina, idConcesion }: Props) => {
  const { notify } = useNotify();

  const [ejecutoras, setEjecutoras] = useState<RES_EmpresaEjecutora[]>([]);
  const [disponibles, setDisponibles] = useState<RES_EmpresaDisponible[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [resEjecutoras, resDisponibles] = await Promise.all([
        MinasService.getEmpresasEjecutoras(idMina),
        MinasService.getEmpresasDisponibles(idConcesion, idMina),
      ]);
      if (resEjecutoras.data.success) setEjecutoras(resEjecutoras.data.data);
      if (resDisponibles.data.success) setDisponibles(resDisponibles.data.data);
    } catch {
      notify({ type: "error", content: "Error al cargar las empresas" });
    } finally {
      setLoading(false);
    }
  }, [idMina, idConcesion, notify]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const asignarEmpresa = async (id_empresa: number) => {
    setLoadingAdd(true);
    try {
      const { data: res } = await MinasService.asignarEmpresa({
        id_mina: idMina,
        id_empresa,
      });
      if (res.success) {
        setEjecutoras((prev) => [...prev, res.data]);
        setDisponibles((prev) =>
          prev.filter((e) => e.id_empresa !== id_empresa),
        );
        notify({ type: "success", content: "Empresa asignada correctamente" });
      } else {
        notify({ type: "error", content: res.message });
      }
    } catch {
      notify({ type: "error", content: "Error al asignar la empresa" });
    } finally {
      setLoadingAdd(false);
    }
  };

  const desasignarEmpresa = async (id_empresa_mina: number) => {
    const empresa = ejecutoras.find(
      (e) => e.id_empresa_mina === id_empresa_mina,
    );
    try {
      const { data: res } =
        await MinasService.desasignarEmpresa(id_empresa_mina);
      if (res.success) {
        setEjecutoras((prev) =>
          prev.filter((e) => e.id_empresa_mina !== id_empresa_mina),
        );
        if (empresa) {
          setDisponibles((prev) => [
            ...prev,
            {
              id_empresa: 0,
              razon_social: empresa.razon_social,
              path_logo: empresa.path_logo,
            },
          ]);
        }
        notify({ type: "success", content: "Empresa removida de la mina" });
      } else {
        notify({ type: "error", content: res.message });
      }
    } catch {
      notify({ type: "error", content: "Error al remover la empresa" });
    }
  };

  return {
    ejecutoras,
    disponibles,
    loading,
    loadingAdd,
    asignarEmpresa,
    desasignarEmpresa,
  };
};
