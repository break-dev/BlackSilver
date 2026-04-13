import { useState, useCallback } from "react";
import { PrestamosAtencionService } from "../service/prestamos-atencion.service";
import type { RES_Trazabilidad } from "../../../service/responses/_generic/trazabilidad";

export const useTrazabilidadPrestamo = () => {
  const [trazabilidad, setTrazabilidad] = useState<RES_Trazabilidad[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  const cargarTrazabilidad = useCallback(async (idDetalle: number) => {
    setLoading(true);
    try {
      const res = await PrestamosAtencionService.obtenerTrazabilidad(idDetalle);
      if (res.success) {
        setTrazabilidad(res.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    trazabilidad,
    loading,
    cargarTrazabilidad,
  };
};
