import { useState } from "react";
import { PrestamosService } from "../service/prestamos.service";
import type { RES_PrestamoDetalle } from "../service/prestamos.responses";
import { useNotify } from "../../../hooks/useNotify";

export const useDetallePrestamo = () => {
  const { notifyError } = useNotify();
  const [detalles, setDetalles] = useState<RES_PrestamoDetalle[]>([]);
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);
  const [selectedPrestamoId, setSelectedPrestamoId] = useState<number | null>(
    null,
  );

  const [openedRepo, setOpenedRepo] = useState(false);
  const [openedHistorialRepo, setOpenedHistorialRepo] = useState(false);
  const [selectedItemsRepo, setSelectedItemsRepo] = useState<
    RES_PrestamoDetalle[]
  >([]);

  const fetchDetalles = async (idPrestamo: number) => {
    setLoading(true);
    setSelectedPrestamoId(idPrestamo);
    setOpened(true);
    try {
      const data = await PrestamosService.getDetallesPrestamo(idPrestamo);
      setDetalles(data);
    } catch {
      notifyError("No se pudieron obtener los detalles del préstamo");
      setOpened(false);
    } finally {
      setLoading(false);
    }
  };

  const closeDetail = () => {
    setOpened(false);
    setDetalles([]);
    setSelectedPrestamoId(null);
  };

  const openReposicion = (items: RES_PrestamoDetalle[]) => {
    setSelectedItemsRepo(items);
    setOpenedRepo(true);
  };

  const closeReposicion = () => {
    setOpenedRepo(false);
    setSelectedItemsRepo([]);
  };

  const openHistorialRepo = () => setOpenedHistorialRepo(true);
  const closeHistorialRepo = () => setOpenedHistorialRepo(false);

  return {
    detalles,
    loading,
    opened,
    fetchDetalles,
    closeDetail,
    selectedPrestamoId,
    // Reposicion
    openedRepo,
    selectedItemsRepo,
    openReposicion,
    closeReposicion,
    // Historial Repo
    openedHistorialRepo,
    openHistorialRepo,
    closeHistorialRepo,
    reloadDetalles: () =>
      selectedPrestamoId && fetchDetalles(selectedPrestamoId),
  };
};
