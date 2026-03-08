import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { AlmacenesService } from "../service/almacenes.service";
import { Schema_NuevoResponsable } from "../service/almacenes.requests";
import type { IMessage } from "../../../shared/interfaces";
import type {
  RES_EmpleadoDisponible,
  RES_ResponsableAlmacen,
} from "../service/almacenes.responses";

/**
 * Maneja el formulario de asignación de un nuevo responsable a un almacén.
 * Incluye la carga de empleados disponibles.
 */
export const useNuevoResponsable = (id_almacen: number) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<IMessage>({ type: "", content: "" });

  // Empleados disponibles
  const [empleados, setEmpleados] = useState<RES_EmpleadoDisponible[]>([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);

  // Form
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<
    string | null
  >(null);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(new Date());
  const [formError, setFormError] = useState("");

  useEffect(() => {
    cargarEmpleados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_almacen]);

  const cargarEmpleados = async () => {
    setLoadingEmpleados(true);
    try {
      const result = await AlmacenesService.get_empleados(id_almacen);
      if (result.success) {
        setEmpleados(result.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingEmpleados(false);
    }
  };

  const empleadosOptions = useMemo(
    () =>
      empleados.map((e) => ({
        value: String(e.id_empleado),
        label: e.nombre_completo,
        description: e.dni || undefined,
      })),
    [empleados],
  );

  const asignar = async (): Promise<RES_ResponsableAlmacen | null> => {
    setFormError("");

    if (!empleadoSeleccionado || !fechaInicio) {
      setFormError("Seleccione responsable y fecha de inicio.");
      return null;
    }

    const payload = {
      id_almacen,
      id_empleado: Number(empleadoSeleccionado),
      fecha_inicio: dayjs(fechaInicio).format("YYYY-MM-DD"),
    };

    const validation = Schema_NuevoResponsable.safeParse(payload);
    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message || "Datos inválidos.");
      return null;
    }

    setLoading(true);
    try {
      const result = await AlmacenesService.nuevo_responsable(validation.data);
      if (result.success) {
        setMessage({ type: "success", content: result.message });
        resetForm();
        return result.data;
      } else {
        setFormError(result.message);
        setMessage({ type: "error", content: result.message });
        return null;
      }
    } catch (error) {
      const msg = "Error al asignar el nuevo responsable";
      setFormError(msg);
      setMessage({ type: "error", content: msg });
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmpleadoSeleccionado(null);
    setFechaInicio(new Date());
    setFormError("");
  };

  return {
    loading: loading || loadingEmpleados,
    message,
    empleadosOptions,
    empleadoSeleccionado,
    setEmpleadoSeleccionado,
    fechaInicio,
    setFechaInicio,
    formError,
    asignar,
  };
};
