import { useState, useCallback } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { CategoriasService } from "../service/categorias.service";
import { Schema_RegistroCategoria } from "../service/categorias.requests";
import type { RES_Categoria } from "../service/categorias.responses";

interface UseRegistroCategoriaProps {
  onSuccess?: (nueva: RES_Categoria) => void;
  onClose: () => void;
}

export const useRegistroCategoria = ({
  onSuccess,
  onClose,
}: UseRegistroCategoriaProps) => {
  const { notify } = useNotify();

  // Estado del formulario
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipoRequerimiento, setTipoRequerimiento] = useState<string | null>(
    null,
  );
  const [clasificacionBien, setClasificacionBien] = useState<string | null>(
    null,
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    setNombre("");
    setDescripcion("");
    setTipoRequerimiento(null);
    setClasificacionBien(null);
    setError("");
  }, []);

  const handleGuardar = async () => {
    setError("");
    const data = {
      nombre,
      descripcion,
      tipo_requerimiento: tipoRequerimiento || "",
      clasificacion_bien: clasificacionBien || "",
    };

    const validation = Schema_RegistroCategoria.safeParse(data);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const result = await CategoriasService.crear_categoria(validation.data);
      if (result.success) {
        notify({ type: "success", content: "Categoría creada correctamente" });
        onSuccess?.(result.data);
        onClose();
        reset();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Error inesperado al crear la categoría");
      console.error(err);
    } finally {
      setLoading(true);
      setLoading(false);
    }
  };

  return {
    nombre,
    setNombre,
    descripcion,
    setDescripcion,
    tipoRequerimiento,
    setTipoRequerimiento,
    clasificacionBien,
    setClasificacionBien,
    error,
    loading,
    handleGuardar,
    reset,
  };
};
