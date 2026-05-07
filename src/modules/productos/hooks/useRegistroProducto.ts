import { useState, useCallback, useEffect } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { ProductosService } from "../service/productos.service";
import {
  Schema_CrearProducto,
  type DTO_CrearProducto,
} from "../service/productos.requests";
import type {
  RES_Producto,
  RES_CategoriaBien,
  RES_UnidadMedida,
} from "../service/productos.responses";
import { Periodo } from "../../../shared/enums/_generic/periodo";

const INITIAL_FORM: DTO_CrearProducto = {
  id_categoria: 0,
  id_unidad_medida_base: 0,
  nombre: "",
  es_auditable: false,
  es_perecible: false,
  stock_minimo_base: 0,
  tiempo_espera_vencimiento: null,
  periodo_espera_vencimiento: null,
};

export const useRegistroProducto = (
  onSuccess: (nuevo: RES_Producto) => void,
) => {
  const { notify } = useNotify();
  const [form, setForm] = useState<DTO_CrearProducto>(INITIAL_FORM);
  const [categorias, setCategorias] = useState<RES_CategoriaBien[]>([]);
  const [unidades, setUnidades] = useState<RES_UnidadMedida[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [loadingUnidades, setLoadingUnidades] = useState(false);

  const cargarCategorias = useCallback(async () => {
    setLoadingCategorias(true);
    try {
      const resp = await ProductosService.get_categorias();
      if (resp.success) setCategorias(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCategorias(false);
    }
  }, []);

  const cargarUnidades = useCallback(async () => {
    setLoadingUnidades(true);
    try {
      const resp = await ProductosService.get_unidades_medida();
      if (resp.success) setUnidades(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUnidades(false);
    }
  }, []);

  useEffect(() => {
    cargarCategorias();
    cargarUnidades();
  }, [cargarCategorias, cargarUnidades]);

  const setField = <K extends keyof DTO_CrearProducto>(
    field: K,
    value: DTO_CrearProducto[K],
  ) => {
    setForm((prev) => {
      const newForm = { ...prev, [field]: value };

      // Lógica específica para productos perecibles
      if (field === "es_perecible" && value === true) {
        newForm.periodo_espera_vencimiento = Periodo.Semanal;
        newForm.tiempo_espera_vencimiento = 1;
      }

      return newForm;
    });
  };

  const handleSubmit = async () => {
    const validation = Schema_CrearProducto.safeParse(form);
    if (!validation.success) {
      notify({ type: "error", content: validation.error.issues[0].message });
      return;
    }

    setLoading(true);
    try {
      const resp = await ProductosService.crear_producto(validation.data);
      if (resp.success) {
        notify({ type: "success", content: resp.message });
        onSuccess(resp.data);
        setForm(INITIAL_FORM);
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
    categorias,
    unidades,
    loading,
    loadingCategorias,
    loadingUnidades,
    cargarCategorias,
    handleSubmit,
  };
};
