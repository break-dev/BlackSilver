import { useState, useCallback, useEffect } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { ProductosService } from "../service/productos.service";
import {
  Schema_CrearProducto,
  type DTO_CrearProducto,
} from "../service/productos.requests";
import type { RES_ProductoResumen } from "../service/productos.responses";
import { Periodo } from "../../../shared/enums/_generic/periodo";
import type { RES_UnidadMedida } from "../../../service/responses/unidad-medida";
import { TipoBien } from "../../../shared/enums/_generic/tipo-bien";
import {
  getCoincidencias,
  type SearchResult,
} from "../../../shared/functions/get-coincidencias";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_Categoria } from "../../../service/responses/categoria";

const INITIAL_FORM: DTO_CrearProducto = {
  id_categoria: 0,
  id_unidad_medida_base: 0,
  nombre: "",
  prefijo: null,
  es_auditable: false,
  es_perecible: false,
  para_mantenimiento: false,
  stock_minimo_base: 0,
  costo_promedio_base: 0,
  tiempo_espera_vencimiento: null,
  periodo_espera_vencimiento: null,
};

export const useRegistroProducto = (
  productosExistentes: RES_ProductoResumen[],
  onSuccess: (nuevo: RES_ProductoResumen) => void,
) => {
  const { notify } = useNotify();
  const [form, setForm] = useState<DTO_CrearProducto>(INITIAL_FORM);
  const [categorias, setCategorias] = useState<RES_Categoria[]>([]);
  const [unidades, setUnidades] = useState<RES_UnidadMedida[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [loadingUnidades, setLoadingUnidades] = useState(false);

  // Estado para coincidencias de nombres
  const [coincidencias, setCoincidencias] = useState<
    SearchResult<RES_ProductoResumen>[]
  >([]);

  const cargarCategorias = useCallback(async () => {
    setLoadingCategorias(true);
    try {
      const resp = await AuxService.get_categorias();
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
      const resp = await AuxService.get_unidades_medida();
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

      // Si cambia la categoría, verificar si es auditable
      if (field === "id_categoria") {
        const cat = categorias.find((c) => c.id_categoria === value);
        if (cat) {
          newForm.es_auditable = !!cat.es_auditable;

          // Si es Activo Fijo, la unidad de medida base es "Unidad" (ID 7)
          if (cat.clasificacion_bien === TipoBien.ActivoFijo) {
            newForm.id_unidad_medida_base = 7;
            newForm.stock_minimo_base = 0;
            newForm.es_perecible = false;
          }
        }
      }

      return newForm;
    });

    // Buscar coincidencias si el campo es el nombre
    if (field === "nombre") {
      const query = String(value);
      if (query.length >= 3) {
        const results = getCoincidencias(productosExistentes, query, {
          keys: ["nombre"],
          fuseThreshold: 0.3, // Más estricto para evitar ruido excesivo
        });
        setCoincidencias(results);
      } else {
        setCoincidencias([]);
      }
    }
  };

  const handleSubmit = async () => {
    // Validar prefijo si es Activo Fijo
    const categoriaSeleccionada = categorias.find(
      (c) => c.id_categoria === form.id_categoria,
    );
    if (
      categoriaSeleccionada?.clasificacion_bien === TipoBien.ActivoFijo &&
      (!form.prefijo || form.prefijo.trim() === "")
    ) {
      notify({
        type: "error",
        content: "El prefijo es obligatorio para activos fijos",
      });
      return;
    }

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
        setCoincidencias([]);
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
    coincidencias,
    loading,
    loadingCategorias,
    loadingUnidades,
    cargarCategorias,
    handleSubmit,
  };
};
