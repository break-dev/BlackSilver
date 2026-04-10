import { useState, useCallback, useEffect } from "react";
import type { 
  DTO_CotizacionRequest, 
  DTO_ProductoComparativo, 
  DTO_CotizacionDetalle,
  DTO_RegistrarComparativo
} from "../service/cotizaciones.requests";
import type { 
  RES_MaestroProducto, 
  RES_MaestroProveedor, 
  RES_MaestroUnidadMedida 
} from "../service/cotizaciones.responses";
import { CotizacionesService } from "../service/cotizaciones.service";
import { useNotify } from "../../../hooks/useNotify";
import { EstadoCotizacion, MetodoPago } from "../../../shared/enums/estados";

export const useRegistroCotizacion = (onSuccess: () => void) => {
  const { notify } = useNotify();
  const [loading, setLoading] = useState(false);
  
  // Estados para maestros
  const [maestros, setMaestros] = useState<{
    proveedores: RES_MaestroProveedor[];
    unidades: RES_MaestroUnidadMedida[];
    catalogo: RES_MaestroProducto[];
  }>({
    proveedores: [],
    unidades: [],
    catalogo: [],
  });

  const [productos, setProductos] = useState<DTO_ProductoComparativo[]>([]);
  const [cotizaciones, setCotizaciones] = useState<DTO_CotizacionRequest[]>([]);

  // Carga inicial de maestros
  useEffect(() => {
    const cargarMaestros = async () => {
      try {
        const [resProv, resUni, resProd] = await Promise.all([
          CotizacionesService.get_proveedores_maestro(),
          CotizacionesService.get_unidades_medida_maestro(),
          CotizacionesService.get_productos_maestro()
        ]);

        setMaestros({
          proveedores: resProv.success ? resProv.data : [],
          unidades: resUni.success ? resUni.data : [],
          catalogo: resProd.success ? resProd.data : [],
        });
      } catch (error) {
        console.error("Error al cargar maestros en hook", error);
      }
    };
    cargarMaestros();
  }, []);

  // Paso 1: Añadir/Quitar productos base del comparativo
  const agregarProductoAlComparador = useCallback((id_producto: number) => {
    setProductos((prev) => {
      if (prev.some((p) => p.id_producto === id_producto)) return prev;
      
      const nuevoProd: DTO_ProductoComparativo = {
        id_producto,
        id_solicitud_detalle: null
      };

      // Si ya hay cotizaciones, les añadimos este producto automáticamente
      setCotizaciones((prevCots) => 
        prevCots.map(cot => ({
          ...cot,
          detalles: [
            ...cot.detalles,
            {
              id_producto,
              id_unidad_medida: 1, // Por defecto
              cantidad: 1,
              contenido_por_presentacion: 1,
              cantidad_base: 1,
              precio_unitario: 0,
              precio_unitario_base: 0,
              comentario: null
            }
          ]
        }))
      );

      return [...prev, nuevoProd];
    });
  }, []);

  // Paso 2: Añadir una nueva columna (oferta) al comparativo
  const agregarCotizacion = useCallback(() => {
    setCotizaciones((prev) => {
      const nuevaCot: DTO_CotizacionRequest = {
        id_proveedor: 0,
        moneda: "Soles",
        metodo_pago: MetodoPago.Contado,
        fecha_vencimiento_pago: null,
        total_antes_igv: 0,
        incluye_igv: true,
        porcentaje_igv: 18,
        monto_igv: 0,
        total_despues_igv: 0,
        observacion: null,
        estado: EstadoCotizacion.Generada,
        detalles: productos.map((p) => ({
          id_producto: p.id_producto,
          id_unidad_medida: 1,
          cantidad: 1,
          contenido_por_presentacion: 1,
          cantidad_base: 1,
          precio_unitario: 0,
          precio_unitario_base: 0,
          comentario: null,
        })),
      };
      return [...prev, nuevaCot];
    });
  }, [productos]);

  const eliminarCotizacion = useCallback((index: number) => {
    setCotizaciones((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Actualización de cabeceras (Proveedor, Moneda, etc)
  const updateCotizacionHeader = useCallback(<K extends keyof DTO_CotizacionRequest>(
    index: number,
    field: K,
    value: DTO_CotizacionRequest[K]
  ) => {
    setCotizaciones((prev) => {
      const p = [...prev];
      const target = { ...p[index], [field]: value };

      if (field === "incluye_igv" || field === "porcentaje_igv" || field === "id_proveedor") {
        const sumDetalles = target.detalles.reduce((acc, d) => acc + (d.cantidad * d.precio_unitario), 0);
        const factor = 1 + (target.porcentaje_igv / 100);

        if (target.incluye_igv) {
          target.total_despues_igv = sumDetalles;
          target.total_antes_igv = sumDetalles / factor;
          target.monto_igv = sumDetalles - target.total_antes_igv;
        } else {
          target.total_antes_igv = sumDetalles;
          target.monto_igv = sumDetalles * (target.porcentaje_igv / 100);
          target.total_despues_igv = sumDetalles + target.monto_igv;
        }
      }

      p[index] = target;
      return p;
    });
  }, []);

  // Actualización de detalles (Precios, cantidades por proveedor)
  const updateCotizacionDetail = useCallback(<K extends keyof DTO_CotizacionDetalle>(
    cotIndex: number,
    prodId: number,
    field: K,
    value: DTO_CotizacionDetalle[K]
  ) => {
    setCotizaciones((prev) => {
      const p = [...prev];
      const cot = { ...p[cotIndex] };
      const detalles = cot.detalles.map((d) => {
        if (d.id_producto !== prodId) return d;
        
        const updatedDet = { ...d, [field]: value };
        
        updatedDet.cantidad_base = updatedDet.cantidad * updatedDet.contenido_por_presentacion;
        updatedDet.precio_unitario_base = updatedDet.contenido_por_presentacion > 0 
          ? updatedDet.precio_unitario / updatedDet.contenido_por_presentacion 
          : 0;

        return updatedDet;
      });

      cot.detalles = detalles;
      
      const sumDetalles = detalles.reduce((acc, d) => acc + (d.cantidad * d.precio_unitario), 0);
      const factor = 1 + (cot.porcentaje_igv / 100);

      if (cot.incluye_igv) {
        cot.total_despues_igv = sumDetalles;
        cot.total_antes_igv = sumDetalles / factor;
        cot.monto_igv = sumDetalles - cot.total_antes_igv;
      } else {
        cot.total_antes_igv = sumDetalles;
        cot.monto_igv = sumDetalles * (cot.porcentaje_igv / 100);
        cot.total_despues_igv = sumDetalles + cot.monto_igv;
      }

      p[cotIndex] = cot;
      return p;
    });
  }, []);

  const handleSave = async () => {
    if (cotizaciones.length === 0) {
      notify({ type: "info", content: "Debe añadir al menos una cotización." });
      return;
    }

    if (cotizaciones.some(c => c.id_proveedor === 0)) {
      notify({ type: "info", content: "Todas las cotizaciones deben tener un proveedor asignado." });
      return;
    }

    setLoading(true);
    try {
      const payload: DTO_RegistrarComparativo = {
        productos: productos,
        cotizaciones: cotizaciones.map(c => ({
            ...c,
            total_antes_igv: Number(c.total_antes_igv.toFixed(2)),
            monto_igv: Number(c.monto_igv.toFixed(2)),
            total_despues_igv: Number(c.total_despues_igv.toFixed(2))
        }))
      };

      const resp = await CotizacionesService.registrar_comparativo(payload);

      if (resp.success) {
        notify({ type: "success", content: "Comparativo registrado correctamente." });
        onSuccess();
      } else {
        notify({ type: "error", content: resp.message });
      }
    } catch {
      notify({ type: "error", content: "Ocurrió un error al guardar el comparativo." });
    } finally {
      setLoading(false);
    }
  };

  return {
    productos,
    cotizaciones,
    maestros,
    loading,
    agregarProductoAlComparador,
    agregarCotizacion,
    eliminarCotizacion,
    updateCotizacionHeader,
    updateCotizacionDetail,
    handleSave,
  };
};
