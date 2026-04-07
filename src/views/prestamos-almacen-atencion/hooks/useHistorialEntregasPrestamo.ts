import { useState, useCallback } from "react";
import { PrestamosAtencionService } from "../service/prestamos-atencion.service";
import type { RES_EntregaPrestamo } from "../service/prestamos-atencion.responses";

export const useHistorialEntregasPrestamo = () => {
  const [entregas, setEntregas] = useState<RES_EntregaPrestamo[]>([]);
  const [loading, setLoading] = useState(false);

  const cargarHistorial = useCallback(async (idPrestamo: number) => {
    setLoading(true);
    try {
      const res =
        await PrestamosAtencionService.obtenerDetallePrestamo(idPrestamo);
      if (res.success) {
        setEntregas(res.data.entregas || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    entregas,
    loading,
    cargarHistorial,
  };
};
