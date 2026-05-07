import { useState, useCallback } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { CategoriasService } from "../service/categorias.service";
import { Schema_RegistroCategoria } from "../service/categorias.requests";
import type { RES_Categoria } from "../service/categorias.responses";
import { TipoProducto } from "../../../shared/enums/_generic/tipo-producto";
import { TipoBien } from "../../../shared/enums/_generic/tipo-bien";

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
  const [tipoProducto, setTipoProducto] = useState<string | null>(
    TipoProducto.Bien,
  );
  const [clasificacionBien, setClasificacionBien] = useState<string | null>(
    TipoBien.Suministro,
  );
  const [esConsumible, setEsConsumible] = useState(false);
  const [paraCocina, setParaCocina] = useState(false);
  const [paraMina, setParaMina] = useState(true);
  const [idsConsumidoras, setIdsConsumidoras] = useState<number[]>([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    setNombre("");
    setDescripcion("");
    setTipoProducto(null);
    setClasificacionBien(null);
    setEsConsumible(false);
    setParaCocina(false);
    setParaMina(true);
    setIdsConsumidoras([]);
    setError("");
  }, []);

  const handleGuardar = async () => {
    setError("");
    const data = {
      nombre,
      descripcion,
      tipo_producto: tipoProducto || "",
      clasificacion_bien: clasificacionBien || "",
      es_consumible: esConsumible,
      para_cocina: paraCocina,
      para_mina: paraMina,
      ids_categorias_consumidoras: idsConsumidoras,
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
    tipoProducto,
    setTipoProducto,
    clasificacionBien,
    setClasificacionBien,
    esConsumible,
    setEsConsumible,
    paraCocina,
    setParaCocina,
    paraMina,
    setParaMina,
    idsConsumidoras,
    setIdsConsumidoras,
    error,
    loading,
    handleGuardar,
    reset,
  };
};
