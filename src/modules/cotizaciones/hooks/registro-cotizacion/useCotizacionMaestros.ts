import { useState, useEffect } from "react";
import { CotizacionesService } from "../../service/cotizaciones.service";
import type { MaestrosState } from "./utils";

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
          CotizacionesService.get_proveedores_maestro(),
          CotizacionesService.get_unidades_medida_maestro(),
          CotizacionesService.get_productos_maestro(),
          CotizacionesService.get_empresas_maestro(),
          CotizacionesService.get_almacenes_maestro(),
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
