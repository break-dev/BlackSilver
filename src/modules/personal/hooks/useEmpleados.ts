import { useState, useCallback, useEffect, useMemo } from "react";
import { EmpleadosService } from "../service/empleados.service";
import type { RES_EmpleadoResumen } from "../service/empleados.responses";

export const useEmpleados = () => {
  const [empleados, setEmpleados] = useState<RES_EmpleadoResumen[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [idActualizandoFoto, setIdActualizandoFoto] = useState<number | null>(
    null,
  );
  const [modalContratoEmpleado, setModalContratoEmpleado] = useState<{
    abierto: boolean;
    idEmpleado: number | null;
    nombre: string;
  } | null>(null);
  const [modalHistorialContratos, setModalHistorialContratos] = useState<{
    abierto: boolean;
    idEmpleado: number | null;
    nombre: string;
  } | null>(null);

  // Selección masiva (fotocheck)
  const [seleccionados, setSeleccionados] = useState<Set<number>>(
    new Set(),
  );
  const [modalFotocheckAbierto, setModalFotocheckAbierto] = useState(false);

  const listar = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await EmpleadosService.get_empleados();
      if (resp.success) setEmpleados(resp.data);
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
    let results = empleados;

    const query = busqueda.toLowerCase().trim();
    if (query) {
      results = results.filter(
        (e) =>
          e.nombre.toLowerCase().includes(query) ||
          e.apellido.toLowerCase().includes(query) ||
          e.dni?.includes(query) ||
          (e.cargo ?? "").toLowerCase().includes(query) ||
          (e.area ?? "").toLowerCase().includes(query),
      );
    }

    return results;
  }, [empleados, busqueda]);

  const pushNuevoEmpleado = (nuevo: RES_EmpleadoResumen) => {
    setEmpleados((prev) => [nuevo, ...prev]);
  };

  const actualizarEmpleadoEnLista = (editado: RES_EmpleadoResumen) => {
    setEmpleados((prev) =>
      prev.map((e) => (e.id_empleado === editado.id_empleado ? editado : e)),
    );
  };

  const actualizarFoto = async (idEmpleado: number, file: File) => {
    setIdActualizandoFoto(idEmpleado);
    try {
      const resp = await EmpleadosService.actualizar_foto(idEmpleado, file);
      if (resp.success) {
        setEmpleados((prev) =>
          prev.map((e) =>
            e.id_empleado === idEmpleado ? { ...e, url_foto: resp.data } : e,
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

  const abrirModalContrato = (idEmpleado: number, nombre: string) => {
    setModalContratoEmpleado({
      abierto: true,
      idEmpleado,
      nombre,
    });
  };

  const cerrarModalContrato = () => {
    setModalContratoEmpleado(null);
  };

  const abrirModalHistorial = (idEmpleado: number, nombre: string) => {
    setModalHistorialContratos({ abierto: true, idEmpleado, nombre });
  };

  const cerrarModalHistorial = () => {
    setModalHistorialContratos(null);
  };

  const onContratoCreado = async (
    payload?: { empleado?: import("../service/empleados.responses").RES_EmpleadoResumen },
  ) => {
    cerrarModalContrato();
    if (payload?.empleado) {
      // Update reactivo: el backend ya devuelve el empleado actualizado
      // (id_contrato_vigente + cargo del contrato). Sin refetch total.
      actualizarEmpleadoEnLista(payload.empleado);
      return;
    }
    // Fallback: si por alguna razón no llega el payload, refetch completo.
    await listar();
  };

  // Selección masiva para fotocheck
  const toggleSeleccion = useCallback((idEmpleado: number) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(idEmpleado)) next.delete(idEmpleado);
      else next.add(idEmpleado);
      return next;
    });
  }, []);

  const toggleSeleccionarTodos = useCallback(() => {
    setSeleccionados((prev) => {
      const visibles = filtrados.map((e) => e.id_empleado);
      const todosVisiblesSeleccionados = visibles.every((id) =>
        prev.has(id),
      );
      if (todosVisiblesSeleccionados) {
        // Deseleccionar solo los visibles
        const next = new Set(prev);
        visibles.forEach((id) => next.delete(id));
        return next;
      }
      // Seleccionar todos los visibles
      const next = new Set(prev);
      visibles.forEach((id) => next.add(id));
      return next;
    });
  }, [filtrados]);

  const limpiarSeleccion = useCallback(() => {
    setSeleccionados(new Set());
  }, []);

  const abrirModalFotocheck = useCallback(() => {
    if (seleccionados.size === 0) return;
    setModalFotocheckAbierto(true);
  }, [seleccionados.size]);

  const cerrarModalFotocheck = useCallback(() => {
    setModalFotocheckAbierto(false);
  }, []);

  // Empleados seleccionados como array (preserva el orden del listado filtrado)
  const empleadosSeleccionados = useMemo(
    () => filtrados.filter((e) => seleccionados.has(e.id_empleado)),
    [filtrados, seleccionados],
  );

  // Para el "todos seleccionados / indeterminado" del checkbox del header
  const todosVisiblesSeleccionados = useMemo(() => {
    if (filtrados.length === 0) return false;
    return filtrados.every((e) => seleccionados.has(e.id_empleado));
  }, [filtrados, seleccionados]);

  const algunosVisiblesSeleccionados = useMemo(() => {
    return filtrados.some((e) => seleccionados.has(e.id_empleado));
  }, [filtrados, seleccionados]);

  return {
    empleados: filtrados,
    loading,
    busqueda,
    setBusqueda,
    recargar: () => listar(),
    pushNuevoEmpleado,
    actualizarFoto,
    actualizarEmpleadoEnLista,
    idActualizandoFoto,
    modalContratoEmpleado,
    abrirModalContrato,
    cerrarModalContrato,
    onContratoCreado,
    modalHistorialContratos,
    abrirModalHistorial,
    cerrarModalHistorial,

    // Selección masiva
    seleccionados,
    empleadosSeleccionados,
    toggleSeleccion,
    toggleSeleccionarTodos,
    limpiarSeleccion,
    todosVisiblesSeleccionados,
    algunosVisiblesSeleccionados,
    modalFotocheckAbierto,
    abrirModalFotocheck,
    cerrarModalFotocheck,
  };
};
