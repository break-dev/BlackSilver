import { useState, useCallback, useEffect } from "react";
import { MinasService } from "../../service/minas.service";
import type { RES_Empresa } from "../../../../service/responses/empresa";

interface Props {
  idMina: number;
  idConcesion: number;
}

export const useRegistroEmpresaEjecutora = ({ idMina, idConcesion }: Props) => {
  const [disponibles, setDisponibles] = useState<RES_Empresa[]>([]);
  const [loadingDisponibles, setLoadingDisponibles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idEmpresa, setIdEmpresa] = useState<number | null>(null);

  const cargarDisponibles = useCallback(async () => {
    setLoadingDisponibles(true);
    try {
      const res = await MinasService.getEmpresasDisponibles(
        idConcesion,
        idMina,
      );
      if (res.success) setDisponibles(res.data);
    } finally {
      setLoadingDisponibles(false);
    }
  }, [idConcesion, idMina]);

  useEffect(() => {
    cargarDisponibles();
  }, [cargarDisponibles]);

  const asignarEmpresa = async (id_empresa: number) => {
    setIsSubmitting(true);
    try {
      const res = await MinasService.asignarEmpresa({
        id_mina: idMina,
        id_empresa,
      });
      if (res.success) {
        setIdEmpresa(null); // Resetear selección
        cargarDisponibles();
        return res.data;
      }
      throw new Error(res.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    disponibles,
    loadingDisponibles,
    isSubmitting,
    idEmpresa,
    setIdEmpresa,
    asignarEmpresa,
  };
};
