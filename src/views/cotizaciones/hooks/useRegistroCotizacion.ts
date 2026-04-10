import { useState } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { CotizacionesService } from "../service/cotizaciones.service";
import { EstadoCotizacion, MetodoPago } from "../../../shared/enums/estados";
import type { 
  DTO_RegistrarComparativo, 
  DTO_CotizacionRequest, 
  DTO_ProductoComparativo,
  DTO_CotizacionDetalle
} from "../service/cotizaciones.requests";

export const useRegistroCotizacion = (onSuccess: () => void) => {
  const { notify } = useNotify();
  const [loading, setLoading] = useState(false);

  const [productos, setProductos] = useState<DTO_ProductoComparativo[]>([]);
  const [cotizaciones, setCotizaciones] = useState<DTO_CotizacionRequest[]>([]);

  const agregarProductoAlComparador = (id_producto: number) => {
    if (productos.some(p => p.id_producto === id_producto)) return;
    
    const nuevoProducto: DTO_ProductoComparativo = { id_producto };
    setProductos(prev => [...prev, nuevoProducto]);

    setCotizaciones(prev => prev.map(cot => ({
      ...cot,
      detalles: [...cot.detalles, {
        id_producto,
        id_unidad_medida: 0,
        cantidad: 0,
        contenido_por_presentacion: 1,
        cantidad_base: 0,
        precio_unitario: 0,
        precio_unitario_base: 0,
        comentario: ""
      }]
    })));
  };

  const agregarProveedor = (id_proveedor: number) => {
    if (cotizaciones.some(c => c.id_proveedor === id_proveedor)) {
      notify({ type: "error", content: "Este proveedor ya ha sido añadido." });
      return;
    }

    const nuevaCot: DTO_CotizacionRequest = {
      id_proveedor,
      moneda: "Soles",
      metodo_pago: MetodoPago.Contado,
      fecha_vencimiento_pago: null,
      incluye_igv: true,
      porcentaje_igv: 18,
      total_antes_igv: 0,
      monto_igv: 0,
      total_despues_igv: 0,
      estado: EstadoCotizacion.Generada,
      detalles: productos.map(p => ({
        id_producto: p.id_producto,
        id_unidad_medida: 0,
        cantidad: 0,
        contenido_por_presentacion: 1,
        cantidad_base: 0,
        precio_unitario: 0,
        precio_unitario_base: 0,
        comentario: ""
      }))
    };

    setCotizaciones(prev => [...prev, nuevaCot]);
  };

  const calcularTotalesCotizacion = (cot: DTO_CotizacionRequest): DTO_CotizacionRequest => {
    const subtotal = cot.detalles.reduce((acc, det) => acc + (det.cantidad * det.precio_unitario), 0);
    const porcentaje = cot.porcentaje_igv / 100;
    
    let monto_igv = 0;
    let total_final = 0;

    if (cot.incluye_igv) {
      total_final = subtotal;
      monto_igv = subtotal - (subtotal / (1 + porcentaje));
    } else {
      monto_igv = subtotal * porcentaje;
      total_final = subtotal + monto_igv;
    }

    return {
      ...cot,
      total_antes_igv: subtotal,
      monto_igv: Number(monto_igv.toFixed(2)),
      total_despues_igv: Number(total_final.toFixed(2))
    };
  };

  const updateCotizacionHeader = <K extends keyof DTO_CotizacionRequest>(
    index: number, 
    field: K, 
    value: DTO_CotizacionRequest[K]
  ) => {
    setCotizaciones(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      
      if (['incluye_igv', 'porcentaje_igv'].includes(field as string)) {
        copy[index] = calcularTotalesCotizacion(copy[index]);
      }
      
      return copy;
    });
  };

  const updateCotizacionDetail = <K extends keyof DTO_CotizacionDetalle>(
    cotIndex: number, 
    prodId: number, 
    field: K, 
    value: DTO_CotizacionDetalle[K]
  ) => {
    setCotizaciones(prev => {
      const copy = [...prev];
      const cot = { ...copy[cotIndex] };
      const detalles = [...cot.detalles];
      const detIndex = detalles.findIndex(d => d.id_producto === prodId);

      if (detIndex !== -1) {
        const det = { ...detalles[detIndex], [field]: value };

        if (field === 'cantidad' || field === 'contenido_por_presentacion') {
          det.cantidad_base = Number(det.cantidad) * Number(det.contenido_por_presentacion);
        }
        if (field === 'precio_unitario' || field === 'contenido_por_presentacion') {
          det.precio_unitario_base = det.contenido_por_presentacion > 0 
            ? Number(det.precio_unitario) / Number(det.contenido_por_presentacion) 
            : 0;
        }

        detalles[detIndex] = det;
        cot.detalles = detalles;
        copy[cotIndex] = calcularTotalesCotizacion(cot);
      }

      return copy;
    });
  };

  const handleSave = async () => {
    if (productos.length === 0) return notify({ type: "error", content: "No hay productos en el comparativo." });
    if (cotizaciones.length === 0) return notify({ type: "error", content: "Debe añadir al menos una cotización." });

    setLoading(true);
    try {
      const dto: DTO_RegistrarComparativo = {
        productos,
        cotizaciones
      };

      const resp = await CotizacionesService.registrar_comparativo(dto);
      if (resp.success) {
        notify({ type: "success", content: resp.message });
        onSuccess();
      } else {
        notify({ type: "error", content: resp.message });
      }
    } catch {
      notify({ type: "error", content: "Error inesperado al intentar guardar." });
    } finally {
      setLoading(false);
    }
  };

  return {
    productos,
    cotizaciones,
    loading,
    agregarProductoAlComparador,
    agregarProveedor,
    updateCotizacionHeader,
    updateCotizacionDetail,
    handleSave
  };
};
