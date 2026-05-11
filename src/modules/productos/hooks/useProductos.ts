import { useState, useCallback, useEffect, useMemo } from "react";
import { ProductosService } from "../service/productos.service";
import type { RES_ProductoResumen } from "../service/productos.responses";
import { useAuditoriaStore } from "../../../stores/auditoria.store";

export const useProductos = () => {
  const { en_modo_auditable } = useAuditoriaStore();
  const [productos, setProductos] = useState<RES_ProductoResumen[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const listar = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await ProductosService.get_productos();
      if (resp.success) setProductos(resp.data);
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
    const query = busqueda.toLowerCase().trim();

    const result = productos.filter(
      (p) => !(en_modo_auditable && p.es_auditable),
    );

    if (!query) return result;

    return result.filter(
      (p) =>
        p.nombre.toLowerCase().includes(query) ||
        p.categoria.toLowerCase().includes(query) ||
        p.unidad_medida_base_abreviatura.toLowerCase().includes(query),
    );
  }, [productos, busqueda, en_modo_auditable]);

  const pushNuevoProducto = (nuevo: RES_ProductoResumen) => {
    setProductos((prev) => [nuevo, ...prev]);
  };

  return {
    productos: filtrados,
    loading,
    busqueda,
    setBusqueda,
    recargar: listar,
    pushNuevoProducto,
  };
};
