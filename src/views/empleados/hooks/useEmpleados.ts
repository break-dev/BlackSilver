import { useState, useCallback, useEffect, useMemo } from "react";
import { EmpleadosService } from "../service/empleados.service";
import type { RES_Empleado, RES_Empresa, RES_Mina } from "../service/empleados.responses";

export const useEmpleados = () => {
  const [empresas, setEmpresas] = useState<RES_Empresa[]>([]);
  const [minas, setMinas] = useState<RES_Mina[]>([]);
  const [idMina, setIdMina] = useState<number | null>(null);
  
  const [empleados, setEmpleados] = useState<RES_Empleado[]>([]);

  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const cargarEmpresas = useCallback(async () => {
    try {
      const resp = await EmpleadosService.get_empresas();
      if (resp.success) setEmpresas(resp.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const cargarMinas = useCallback(async () => {
    setLoadingEmpresas(true);
    try {
      const resp = await EmpleadosService.get_minas();
      if (resp.success) setMinas(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEmpresas(false);
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
    cargarEmpresas();
    cargarMinas();
  }, [cargarEmpresas, cargarMinas]);

  useEffect(() => {
    // Si es null trae todos de golpe
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

  const pushNuevoEmpleado = (_nuevo: RES_Empleado) => {
    // Si estamos filtrando por una mina, solo lo agregamos al state si 
    // su mina_asignada incuye la nuestra o evaluamos después
    // Simplificado: Solo re-cargamos la lista para asegurarnos de su estado.
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
    empresas,
    minas,
    idMina,
    setIdMina,
    empleados: filtrados,
    loadingEmpresas,
    loading,
    busqueda,
    setBusqueda,
    recargar: () => listar(idMina || undefined),
    pushNuevoEmpleado,
    actualizarFoto,
  };
};
