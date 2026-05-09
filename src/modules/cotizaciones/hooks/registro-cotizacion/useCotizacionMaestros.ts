import { useState, useEffect } from "react";
import type { MaestrosState } from "./utils";
import { AuxService } from "../../../../service/aux.service";

export const useCotizacionMaestros = () => {
  const [loadingMaestros, setLoadingMaestros] = useState(true);
  const [maestros, setMaestros] = useState<MaestrosState>({
    proveedores: [],
    unidades: [],
    catalogo: [],
    empresas: [],
    almacenes: [],
  });

  useEffect(() => {
    const cargarMaestros = async () => {
      try {
        setLoadingMaestros(true);
        const [resProv, resUni, resProd, resEmp, resAlm] = await Promise.all([
          AuxService.get_proveedores(),
          AuxService.get_unidades_medida(),
          AuxService.get_productos(),
          AuxService.get_empresas(),
          AuxService.get_almacenes(),
        ]);

        setMaestros({
          proveedores: resProv.success ? resProv.data : [],
          unidades: resUni.success ? resUni.data : [],
          catalogo: resProd.success ? resProd.data : [],
          empresas: resEmp.success ? resEmp.data : [],
          almacenes: resAlm.success ? resAlm.data : [],
        });
      } catch (error) {
        console.error("Error al cargar maestros en hook", error);
      } finally {
        setLoadingMaestros(false);
      }
    };
    cargarMaestros();
  }, []);

  return { maestros, loadingMaestros };
};
