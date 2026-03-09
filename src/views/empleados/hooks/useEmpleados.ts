import { useState, useCallback, useEffect, useMemo } from "react";
import { EmpleadosService } from "../service/empleados.service";
import type { RES_Empleado, RES_Empresa } from "../service/empleados.responses";

export const useEmpleados = () => {
  const [empresas, setEmpresas] = useState<RES_Empresa[]>([]);
  const [idEmpresa, setIdEmpresa] = useState<number | null>(null);
  const [empleados, setEmpleados] = useState<RES_Empleado[]>([]);

  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const cargarEmpresas = useCallback(async () => {
    setLoadingEmpresas(true);
    try {
      const resp = await EmpleadosService.get_empresas();
      if (resp.success) setEmpresas(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEmpresas(false);
    }
  }, []);

  const listar = useCallback(async (selectedId: number) => {
    setLoading(true);
    try {
      const resp = await EmpleadosService.get_empleados(selectedId);
      if (resp.success) setEmpleados(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarEmpresas();
  }, [cargarEmpresas]);

  useEffect(() => {
    if (idEmpresa) {
      listar(idEmpresa);
    } else {
      setEmpleados([]);
    }
  }, [idEmpresa, listar]);

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

  const pushNuevoEmpleado = (nuevo: RES_Empleado) => {
    // Solo agregar si pertenece a la empresa que estamos visualizando
    if (nuevo.id_empresa === idEmpresa) {
      setEmpleados((prev) => [nuevo, ...prev]);
    }
  };

  return {
    empresas,
    idEmpresa,
    setIdEmpresa,
    empleados: filtrados,
    loadingEmpresas,
    loading,
    busqueda,
    setBusqueda,
    recargar: () => idEmpresa && listar(idEmpresa),
    pushNuevoEmpleado,
  };
};
