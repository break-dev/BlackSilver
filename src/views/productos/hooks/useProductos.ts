import { useState, useCallback, useEffect, useMemo } from "react";
import { ProductosService } from "../service/productos.service";
import type { RES_Producto } from "../service/productos.responses";

export const useProductos = () => {
  const [productos, setProductos] = useState<RES_Producto[]>([]);
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
    if (!query) return productos;
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(query) ||
        p.categoria.toLowerCase().includes(query) ||
        p.unidad_medida_abreviatura.toLowerCase().includes(query),
    );
  }, [productos, busqueda]);

  const pushNuevoProducto = (nuevo: RES_Producto) => {
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
