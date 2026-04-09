import { useState, useCallback, useEffect } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { EmpleadosService } from "../service/empleados.service";
import {
  Schema_CrearEmpleado,
  type DTO_CrearEmpleado,
} from "../service/empleados.requests";
import type {
  RES_Area,
  RES_Cargo,
  RES_Empleado,
  RES_Mina,
} from "../service/empleados.responses";

const INITIAL_FORM: DTO_CrearEmpleado = {
  id_mina: 0,
  id_cargo: 0,
  nombre: "",
  apellido: "",
  dni: "",
  ruc: "",
  carnet_extranjeria: "",
  pasaporte: "",
  fecha_nacimiento: "",
  path_foto: "",
};

export const useRegistroEmpleado = (
  onSuccess: (nuevo: RES_Empleado) => void,
  idMinaDefault: number | null = null,
) => {
  const { notify } = useNotify();
  const [form, setForm] = useState<DTO_CrearEmpleado>({
    ...INITIAL_FORM,
    id_mina: idMinaDefault ?? 0,
  });
  const [minas, setMinas] = useState<RES_Mina[]>([]);
  const [areas, setAreas] = useState<RES_Area[]>([]);
  const [cargos, setCargos] = useState<RES_Cargo[]>([]);

  const [idArea, setIdArea] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMinas, setLoadingMinas] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingCargos, setLoadingCargos] = useState(false);

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

  const cargarAreas = useCallback(async () => {
    setLoadingAreas(true);
    try {
      const resp = await EmpleadosService.get_areas();
      if (resp.success) setAreas(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAreas(false);
    }
  }, []);

  useEffect(() => {
    cargarMinas();
    cargarAreas();
  }, [cargarMinas, cargarAreas]);

  const cargarCargos = useCallback(async (areaId: number) => {
    setLoadingCargos(true);
    try {
      const resp = await EmpleadosService.get_cargos(areaId);
      if (resp.success) setCargos(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCargos(false);
    }
  }, []);

  useEffect(() => {
    if (idArea) {
      cargarCargos(idArea);
    } else {
      setCargos([]);
    }
  }, [idArea, cargarCargos]);

  const setField = <K extends keyof DTO_CrearEmpleado>(
    field: K,
    value: DTO_CrearEmpleado[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const validation = Schema_CrearEmpleado.safeParse(form);
    if (!validation.success) {
      notify({ type: "error", content: validation.error.issues[0].message });
      return;
    }

    setLoading(true);
    try {
      const resp = await EmpleadosService.crear_empleado(validation.data);
      if (resp.success) {
        notify({ type: "success", content: resp.message });
        onSuccess(resp.data);
        setForm({ ...INITIAL_FORM, id_mina: idMinaDefault ?? 0 });
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
    setIdArea,
    minas,
    areas,
    cargos,
    loading,
    loadingMinas,
    loadingAreas,
    loadingCargos,
    handleSubmit,
  };
};
