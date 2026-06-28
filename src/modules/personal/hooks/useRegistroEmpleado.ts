import { useState, useCallback, useEffect, useMemo } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { EmpleadosService } from "../service/empleados.service";
import {
  Schema_CrearEmpleado,
  type DTO_CrearEmpleado,
} from "../service/empleados.requests";
import type { RES_EmpleadoResumen } from "../service/empleados.responses";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_Empresa } from "../../../service/responses/empresa";
import type {
  RES_Area,
  RES_Cargo,
} from "../../../service/responses/organigrama";

const INITIAL_FORM: DTO_CrearEmpleado = {
  id_empresa: null,
  id_cargo: 0,
  nombre: "",
  apellido: "",
  dni: "",
  ruc: "",
  carnet_extranjeria: "",
  pasaporte: "",
  fecha_nacimiento: "",
  foto: "",
};

export const useRegistroEmpleado = (
  onSuccess: (nuevo: RES_EmpleadoResumen) => void,
) => {
  const { notify } = useNotify();
  const [form, setForm] = useState<DTO_CrearEmpleado>(INITIAL_FORM);
  const [empresas, setEmpresas] = useState<RES_Empresa[]>([]);
  const [areas, setAreas] = useState<RES_Area[]>([]);
  const [todosCargos, setTodosCargos] = useState<RES_Cargo[]>([]);

  const [idArea, setIdArea] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingCargos, setLoadingCargos] = useState(false);

  // Carga inicial: empresas, áreas y cargos de forma independiente para no bloquearse entre sí
  const cargarCatalogos = useCallback(async () => {
    const fetchEmpresas = async () => {
      setLoadingEmpresas(true);
      try {
        const resp = await AuxService.get_empresas();
        if (resp.success) setEmpresas(resp.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEmpresas(false);
      }
    };

    const fetchAreas = async () => {
      setLoadingAreas(true);
      try {
        const resp = await AuxService.get_areas();
        if (resp.success) setAreas(resp.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAreas(false);
      }
    };

    const fetchCargos = async () => {
      setLoadingCargos(true);
      try {
        const resp = await AuxService.get_cargos();
        if (resp.success) setTodosCargos(resp.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCargos(false);
      }
    };

    fetchEmpresas();
    fetchAreas();
    fetchCargos();
  }, []);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  // Filtrado en memoria: si hay un área seleccionada muestra cargos de ese área + cargos sin área. Si no, muestra todos.
  const cargos = useMemo(() => {
    const sinArea = todosCargos.filter((c) => c.id_area === null);

    if (!idArea) return todosCargos;

    const delArea = todosCargos.filter((c) => c.id_area === idArea);
    return [...delArea, ...sinArea];
  }, [todosCargos, idArea]);

  const setField = <K extends keyof DTO_CrearEmpleado>(
    field: K,
    value: DTO_CrearEmpleado[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSetIdArea = (value: number | null) => {
    setIdArea(value);
    // Limpiar cargo solo si el cargo actualmente seleccionado pertenece a un área
    // (es decir, tiene id_area no null). Los cargos sin área se mantienen seleccionables.
    const cargoActual = todosCargos.find((c) => c.id_cargo === form.id_cargo);
    if (cargoActual && cargoActual.id_area !== null) {
      setForm((prev) => ({ ...prev, id_cargo: 0 }));
    }
  };

  const handleSubmit = async () => {
    const validation = Schema_CrearEmpleado.safeParse(form);
    if (!validation.success) {
      notify({ type: "info", content: validation.error.issues[0].message });
      return;
    }

    setLoading(true);
    try {
      const resp = await EmpleadosService.crear_empleado(validation.data);
      if (resp.success) {
        notify({ type: "success", content: resp.message });
        onSuccess(resp.data);
        setForm(INITIAL_FORM);
        setIdArea(null);
      } else {
        notify({ type: "error", content: resp.message });
      }
    } catch (err) {
      console.error(err);
      notify({ type: "error", content: "Error inesperado" });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setField,
    idArea,
    setIdArea: handleSetIdArea,
    empresas,
    areas,
    cargos,
    loading,
    loadingEmpresas,
    loadingAreas,
    loadingCargos,
    handleSubmit,
  };
};
