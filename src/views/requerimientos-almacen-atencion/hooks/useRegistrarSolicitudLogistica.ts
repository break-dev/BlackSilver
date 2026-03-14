import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { AtencionService } from "../service/atencion.service";
import { Premura } from "../../../shared/enums/otros";
import { EstadoDetalleRequerimiento } from "../../../shared/enums/estados";
import type { DTO_CrearSolicitudLogistica } from "../service/atencion.requests";
import type { DetalleRequerimientoExtendido } from "../service/atencion.responses";

interface UseRegistrarSolicitudLogisticaProps {
  idRequerimiento: number;
  detalles: DetalleRequerimientoExtendido[];
  onSuccess: () => void;
}

export const useRegistrarSolicitudLogistica = ({
  idRequerimiento,
  detalles,
  onSuccess,
}: UseRegistrarSolicitudLogisticaProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [localSelectedIds, setLocalSelectedIds] = useState<number[]>([]);
  
  // Campos generales
  const [observacion, setObservacion] = useState("");
  const [premura, setPremura] = useState<string>(Premura.Normal);
  const [fechaEntrega, setFechaEntrega] = useState<Date | null>(new Date());

  // Campos por ítem
  const [comentarios, setComentarios] = useState<Record<number, string>>({});
  const [cantidades, setCantidades] = useState<Record<number, number>>({});

  const itemsPendientes = detalles.filter(
    (d) => d.estado === EstadoDetalleRequerimiento.EsperandoAprobacion.toString()
  );

  const itemsSeleccionados = itemsPendientes.filter((d) =>
    localSelectedIds.includes(d.id_requerimiento_almacen_detalle)
  );

  useEffect(() => {
    const initCants: Record<number, number> = {};
    itemsPendientes.forEach((d) => {
      initCants[d.id_requerimiento_almacen_detalle] = Number(d.cantidad_solicitada);
    });
    setCantidades(initCants);
    // Seleccionamos todos por defecto
    setLocalSelectedIds(
      itemsPendientes.map((i) => i.id_requerimiento_almacen_detalle)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detalles]);

  const toggleSelection = (id: number) => {
    setLocalSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (localSelectedIds.length === itemsPendientes.length) {
      setLocalSelectedIds([]);
    } else {
      setLocalSelectedIds(
        itemsPendientes.map((i) => i.id_requerimiento_almacen_detalle)
      );
    }
  };

  const handleConsultar = async () => {
    setSubmitting(true);
    try {
      const dto: DTO_CrearSolicitudLogistica = {
        id_requerimiento: idRequerimiento,
        observacion,
        premura,
        fecha_entrega_requerida: fechaEntrega ? dayjs(fechaEntrega).format("YYYY-MM-DD") : "",
        detalles: itemsSeleccionados.map((item) => {
          const cantS = cantidades[item.id_requerimiento_almacen_detalle] || item.cantidad_solicitada;
          const cantB = cantS * (item.contenido_por_presentacion || 1);
          return {
            id_requerimiento_almacen_detalle: item.id_requerimiento_almacen_detalle,
            id_producto: item.id_producto,
            id_unidad_medida: item.unidad_medida_abv === item.unidad_medida_base_abv ? 1 : 2, // 1: Base, 2: Presentación (Según lógica previa)
            cantidad_solicitada: cantS,
            contenido_por_presentacion: item.contenido_por_presentacion,
            cantidad_solicitada_base: cantB,
            comentario: comentarios[item.id_requerimiento_almacen_detalle] || "",
          };
        }),
      };

      const res = await AtencionService.registrarSolicitudLogistica(dto);
      if (res.success) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    state: {
      submitting,
      localSelectedIds,
      observacion,
      premura,
      fechaEntrega,
      comentarios,
      cantidades,
      itemsPendientes,
      itemsSeleccionados,
    },
    actions: {
      setObservacion,
      setPremura,
      setFechaEntrega,
      setComentarios,
      setCantidades,
      toggleSelection,
      toggleAll,
      handleConsultar,
    },
  };
};
