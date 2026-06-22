import { useState, useCallback, useEffect, useMemo } from "react";
import { ContratistasService } from "../service/empleados.service";
import type { RES_ContratistaResumen } from "../service/empleados.responses";

export const useContratistas = () => {
  const [idMina, setIdMina] = useState<number | null>(null);
  const [contratistas, setContratistas] = useState<RES_ContratistaResumen[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [idActualizandoFoto, setIdActualizandoFoto] = useState<number | null>(null);

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
    listar();
  }, [listar]);

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

  const pushNuevoContratista = (nuevo: RES_ContratistaResumen) => {
    setContratistas((prev) => [nuevo, ...prev]);
  };

  const actualizarContratistaEnLista = (editado: RES_ContratistaResumen) => {
    setContratistas((prev) =>
      prev.map((e) => (e.id_contratista === editado.id_contratista ? editado : e)),
    );
  };

  const actualizarFoto = async (idContratista: number, file: File) => {
    setIdActualizandoFoto(idContratista);
    try {
      const resp = await ContratistasService.actualizar_foto(idContratista, file);
      if (resp.success) {
        setContratistas((prev) =>
          prev.map((e) =>
            e.id_contratista === idContratista ? { ...e, url_foto: resp.data } : e,
          ),
        );
        return true;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIdActualizandoFoto(null);
    }
    return false;
  };

  const minasUnicas = useMemo(() => {
    const map = new Map<number, string>();
    contratistas.forEach((c) => {
      if (c.id_mina && c.mina) {
        map.set(c.id_mina, c.mina);
      }
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({
      id_mina: id,
      nombre,
    }));
  }, [contratistas]);

  return {
    minas: minasUnicas,
    idMina,
    setIdMina,
    contratistas: filtrados,
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
