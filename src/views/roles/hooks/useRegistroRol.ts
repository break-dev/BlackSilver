import { useState, useEffect, useCallback } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { RolesService } from "../service/roles.service";
import { Schema_RegistroRol } from "../service/roles.requests";
import type {
  RES_Rol,
  RES_ModuloEstructura,
} from "../service/roles.responses";

interface UseRegistroRolProps {
  onSuccess?: (nuevo: RES_Rol) => void;
  onUpdateSuccess?: () => void;
  onClose: () => void;
  rolEdicion?: RES_Rol | null;
}

export const useRegistroRol = ({
  onSuccess,
  onUpdateSuccess,
  onClose,
  rolEdicion,
}: UseRegistroRolProps) => {
  const { notify } = useNotify();

  // Estructura de permisos (Catálogo)
  const [estructura, setEstructura] = useState<RES_ModuloEstructura[]>([]);
  const [loadingEstructura, setLoadingEstructura] = useState(false);

  // Formulario
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState<number[]>(
    [],
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargarEstructura = useCallback(async () => {
    setLoadingEstructura(true);
    try {
      const result = await RolesService.get_estructura_permisos();
      if (result.success) {
        setEstructura(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEstructura(false);
    }
  }, []);

  useEffect(() => {
    cargarEstructura();
  }, [cargarEstructura]);

  const cargarPermisosRol = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const result = await RolesService.get_permisos_rol(id);
      if (result.success) {
        setSeccionesSeleccionadas(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setNombre("");
    setDescripcion("");
    setSeccionesSeleccionadas([]);
    setError("");
  }, []);

  useEffect(() => {
    if (rolEdicion) {
      setNombre(rolEdicion.nombre);
      setDescripcion(rolEdicion.descripcion || "");
      cargarPermisosRol(rolEdicion.id);
    } else {
      reset();
    }
  }, [rolEdicion, cargarPermisosRol, reset]);

  const handleToggleSeccion = (idSeccion: number) => {
    setSeccionesSeleccionadas((prev) =>
      prev.includes(idSeccion)
        ? prev.filter((id) => id !== idSeccion)
        : [...prev, idSeccion],
    );
  };

  /**
   * Toggle de todas las secciones de un submodulo
   */
  const handleToggleSubmodulo = (idsSecciones: number[], isChecked: boolean) => {
    setSeccionesSeleccionadas((prev) => {
      if (isChecked) {
        // Añadir solo los que no están
        const nuevas = idsSecciones.filter((id) => !prev.includes(id));
        return [...prev, ...nuevas];
      } else {
        // Quitar todos los de ese submodulo
        return prev.filter((id) => !idsSecciones.includes(id));
      }
    });
  };

  const handleGuardar = async () => {
    setError("");
    const data = {
      nombre,
      descripcion,
      secciones: seccionesSeleccionadas,
    };

    const validation = Schema_RegistroRol.safeParse(data);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      if (rolEdicion) {
        // MODO EDICIÓN: Solo actualiza permisos
        const result = await RolesService.actualizar_permisos_rol(
          rolEdicion.id,
          seccionesSeleccionadas,
        );
        if (result.success) {
          notify({
            type: "success",
            content: "Permisos actualizados correctamente",
          });
          onUpdateSuccess?.();
          onClose();
          reset();
        } else {
          setError(result.message);
        }
      } else {
        // MODO CREACIÓN
        const result = await RolesService.crear_rol(validation.data);
        if (result.success) {
          notify({
            type: "success",
            content: "Rol registrado correctamente",
          });
          onSuccess?.(result.data);
          onClose();
          reset();
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError("Error inesperado al procesar el rol");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    estructura,
    loadingEstructura,
    nombre,
    setNombre,
    descripcion,
    setDescripcion,
    seccionesSeleccionadas,
    handleToggleSeccion,
    handleToggleSubmodulo,
    handleGuardar,
    loading,
    error,
    reset,
  };
};
