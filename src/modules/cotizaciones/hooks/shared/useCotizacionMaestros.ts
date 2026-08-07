import { useState, useEffect, useCallback } from "react";
import type { MaestrosState, LoadingMaestrosState } from "./utils";
import { AuxService } from "../../../../service/auxiliar.service";
import type { RES_Proveedor } from "../../../../service/responses/proveedor";
import type { RES_Producto } from "../../../../service/responses/producto";

export const useCotizacionMaestros = () => {
  const [loadingMaestros, setLoadingMaestros] = useState<LoadingMaestrosState>({
    proveedores: true,
    unidades: true,
    catalogo: true,
    empresas: true,
    almacenes: true,
    minas: true,
  });

  const [maestros, setMaestros] = useState<MaestrosState>({
    proveedores: [],
    unidades: [],
    catalogo: [],
    empresas: [],
    almacenes: [],
    minas: [],
  });

  const agregarProveedorLocal = useCallback((nuevo: RES_Proveedor) => {
    setMaestros((prev) => ({
      ...prev,
      proveedores: [...prev.proveedores, nuevo],
    }));
  }, []);

  const agregarProductoLocal = useCallback((nuevo: RES_Producto) => {
    setMaestros((prev) => {
      // Evitar duplicados si ya existía
      const existe = prev.catalogo.some((p) => p.id_producto === nuevo.id_producto);
      if (existe) return prev;
      return {
        ...prev,
        catalogo: [nuevo, ...prev.catalogo],
      };
    });
  }, []);

  useEffect(() => {
    const cargarMaestro = async <K extends keyof MaestrosState>(
      key: K,
      fetchFn: () => Promise<{ success: boolean; data: MaestrosState[K] }>,
    ) => {
      try {
        setLoadingMaestros((prev) => ({ ...prev, [key]: true }));
        const res = await fetchFn();
        setMaestros((prev) => ({
          ...prev,
          [key]: res.success ? res.data : [],
        }));
      } catch (error) {
        console.error(`Error al cargar maestro ${key} en hook`, error);
      } finally {
        setLoadingMaestros((prev) => ({ ...prev, [key]: false }));
      }
    };

    cargarMaestro("proveedores", AuxService.get_proveedores);
    cargarMaestro("unidades", AuxService.get_unidades_medida);
    cargarMaestro("catalogo", AuxService.get_productos);
    cargarMaestro("empresas", AuxService.get_empresas);
    cargarMaestro("almacenes", AuxService.get_almacenes);
    cargarMaestro("minas", AuxService.get_minas);
  }, []);

  return { maestros, loadingMaestros, agregarProveedorLocal, agregarProductoLocal };
};
