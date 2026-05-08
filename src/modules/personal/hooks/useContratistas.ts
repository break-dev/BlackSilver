import { useState, useCallback, useEffect, useMemo } from "react";
import { ContratistasService, EmpleadosService } from "../service/empleados.service";
import type { RES_Contratista, RES_Mina } from "../service/empleados.responses";

export const useContratistas = () => {
  const [minas, setMinas] = useState<RES_Mina[]>([]);
  const [idMina, setIdMina] = useState<number | null>(null);
  const [contratistas, setContratistas] = useState<RES_Contratista[]>([]);
  const [loadingMinas, setLoadingMinas] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [idActualizandoFoto, setIdActualizandoFoto] = useState<number | null>(null);

  const cargarMinas = useCallback(async () => {
    setLoadingMinas(true);
    try {
      const resp = await EmpleadosService.get_minas();
      if (resp.success) setMinas(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMinas(false);
    }
  }, []);

  const listar = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await ContratistasService.get_contratistas();
      if (resp.success) setContratistas(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarMinas();
    listar();
  }, [cargarMinas, listar]);

  const filtrados = useMemo(() => {
    let results = contratistas;

    // Filtro por Mina Local
    if (idMina) {
      results = results.filter((e) => e.id_mina === idMina);
    }

    // Filtro por Búsqueda Local
    const query = busqueda.toLowerCase().trim();
    if (query) {
      results = results.filter(
        (e) =>
          e.nombre.toLowerCase().includes(query) ||
          e.apellido.toLowerCase().includes(query) ||
          e.dni?.includes(query)
      );
    }

    return results;
  }, [contratistas, idMina, busqueda]);

  const pushNuevoContratista = (nuevo: RES_Contratista) => {
    setContratistas((prev) => [nuevo, ...prev]);
  };

  const actualizarContratistaEnLista = (editado: RES_Contratista) => {
    setContratistas((prev) =>
      prev.map((e) => (e.id_contratista === editado.id_contratista ? editado : e)),
    );
  };

  const actualizarFoto = async (idContratista: number, file: File) => {
    setIdActualizandoFoto(idContratista);
    try {
      const resp = await ContratistasService.actualizar_foto(idContratista, file);
      if (resp.success) {
        actualizarContratistaEnLista(resp.data);
        return true;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIdActualizandoFoto(null);
    }
    return false;
  };

  return {
    minas,
    setMinas,
    idMina,
    setIdMina,
    contratistas: filtrados,
    loadingMinas,
    setLoadingMinas,
    loading,
    busqueda,
    setBusqueda,
    recargar: () => listar(),
    pushNuevoContratista,
    actualizarFoto,
    actualizarContratistaEnLista,
    idActualizandoFoto,
  };
};
