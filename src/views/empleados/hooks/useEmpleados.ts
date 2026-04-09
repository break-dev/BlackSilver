import { useState, useCallback, useEffect, useMemo } from "react";
import { EmpleadosService } from "../service/empleados.service";
import type { RES_Empleado, RES_Mina } from "../service/empleados.responses";

export const useEmpleados = () => {
  const [minas, setMinas] = useState<RES_Mina[]>([]);
  const [idMina, setIdMina] = useState<number | null>(null);
  const [empleados, setEmpleados] = useState<RES_Empleado[]>([]);
  const [loadingMinas, setLoadingMinas] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

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

  const listar = useCallback(async (selectedMina?: number) => {
    setLoading(true);
    try {
      const resp = await EmpleadosService.get_empleados(selectedMina);
      if (resp.success) setEmpleados(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarMinas();
  }, [cargarMinas]);

  useEffect(() => {
    listar(idMina || undefined);
  }, [idMina, listar]);

  const filtrados = useMemo(() => {
    const query = busqueda.toLowerCase().trim();
    if (!query) return empleados;
    return empleados.filter(
      (e) =>
        e.nombre.toLowerCase().includes(query) ||
        e.apellido.toLowerCase().includes(query) ||
        e.dni?.includes(query) ||
        e.cargo.toLowerCase().includes(query),
    );
  }, [empleados, busqueda]);

  const pushNuevoEmpleado = () => {
    listar(idMina || undefined);
  };

  const actualizarEmpleadoEnLista = (editado: RES_Empleado) => {
    setEmpleados((prev) =>
      prev.map((e) => (e.id_empleado === editado.id_empleado ? editado : e)),
    );
  };

  const actualizarFoto = async (idEmpleado: number, file: File) => {
    try {
      const resp = await EmpleadosService.actualizar_foto(idEmpleado, file);
      if (resp.success) {
        actualizarEmpleadoEnLista(resp.data);
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  return {
    minas,
    idMina,
    setIdMina,
    empleados: filtrados,
    loadingMinas,
    loading,
    busqueda,
    setBusqueda,
    recargar: () => listar(idMina || undefined),
    pushNuevoEmpleado,
    actualizarFoto,
  };
};
