import { useState, useEffect, useCallback } from "react";
import type { MaestrosState } from "./utils";
import { AuxService } from "../../../../service/auxiliar.service";
import type { RES_Proveedor } from "../../../../service/responses/proveedor";

export const useCotizacionMaestros = () => {
  const [loadingMaestros, setLoadingMaestros] = useState(true);
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

  useEffect(() => {
    const cargarMaestros = async () => {
      try {
        setLoadingMaestros(true);
        const [resProv, resUni, resProd, resEmp, resAlm, resMin] =
          await Promise.all([
            AuxService.get_proveedores(),
            AuxService.get_unidades_medida(),
            AuxService.get_productos(),
            AuxService.get_empresas(),
            AuxService.get_almacenes(),
            AuxService.get_minas(),
          ]);

        setMaestros({
          proveedores: resProv.success ? resProv.data : [],
          unidades: resUni.success ? resUni.data : [],
          catalogo: resProd.success ? resProd.data : [],
          empresas: resEmp.success ? resEmp.data : [],
          almacenes: resAlm.success ? resAlm.data : [],
          minas: resMin.success ? resMin.data : [],
        });
      } catch (error) {
        console.error("Error al cargar maestros en hook", error);
      } finally {
        setLoadingMaestros(false);
      }
    };
    cargarMaestros();
  }, []);

  return { maestros, loadingMaestros, agregarProveedorLocal };
};
