import { useState, useEffect } from "react";
import { PrestamosService } from "../service/prestamos.service";
import type { RES_PrestamoDetalle } from "../../../service/responses/prestamos/prestamo";
import type { REQ_DetalleReposicionItem } from "../service/prestamos.requests";
import { useAuthStore } from "../../../stores/auth.store";
import type { RES_LoteDisponible } from "../../../service/responses/lote-producto";
import type { RES_PersonalExterno } from "../../../service/responses/personal-externo";
import { useNotify } from "../../../hooks/useNotify";
import { AuxService } from "../../../service/auxiliar.service";

interface UseRegistroReposicionProps {
  idPrestamo: number;
  selectedDetalles: RES_PrestamoDetalle[];
  onSuccess: () => void;
}

export const useRegistroReposicion = ({
  idPrestamo,
  selectedDetalles,
  onSuccess,
}: UseRegistroReposicionProps) => {
  const { usuario } = useAuthStore();
  const { notifySuccess, notifyError } = useNotify();

  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);
  const [loadingPersonal, setLoadingPersonal] = useState(false);
  const [loadingLotes, setLoadingLotes] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const [almacenesPrincipales, setAlmacenesPrincipales] = useState<
    { id_almacen: number; nombre: string }[]
  >([]);
  const [personal, setPersonal] = useState<{ value: string; label: string }[]>(
    [],
  );

  const [idAlmacenEntrega, setIdAlmacenEntrega] = useState<string | null>(null);
  const [idPersonalRecibe, setIdPersonalRecibe] = useState<string | null>(null);

  const [lotesPorProducto, setLotesPorProducto] = useState<
    Record<number, RES_LoteDisponible[]>
  >({});

  // id_detalle -> id_lote -> cantidad_base
  const [reposicionCantidades, setReposicionCantidades] = useState<
    Record<number, Record<number, number>>
  >({});

  const [observacion, setObservacion] = useState("");
  const [evidencias, setEvidencias] = useState<File[]>([]);

  // Cargar almacenes principales
  useEffect(() => {
    const fetchAlmacenes = async () => {
      setLoadingAlmacenes(true);
      try {
        const res = await AuxService.get_almacenes({
          es_principal: true,
        });
        if (res.success) {
          setAlmacenesPrincipales(res.data);
          if (res.data.length > 0) {
            setIdAlmacenEntrega(String(res.data[0].id_almacen));
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingAlmacenes(false);
      }
    };

    const fetchPersonal = async () => {
      setLoadingPersonal(true);
      try {
        const res = await AuxService.get_personal_externo();
        if (res.success) {
          setPersonal(
            res.data.map((p: RES_PersonalExterno) => ({
              value: String(p.id_personal),
              label: `${p.nombre_completo} | ${p.dni || "S/N"}`,
            })),
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingPersonal(false);
      }
    };

    fetchAlmacenes();
    fetchPersonal();
  }, []);

  // Cargar lotes cuando cambie el almacén
  useEffect(() => {
    if (!idAlmacenEntrega || selectedDetalles.length === 0) return;

    const fetchLotes = async () => {
      setLoadingLotes(true);
      try {
        const ids = selectedDetalles.map((d) => d.id_producto);
        const res = await AuxService.get_lotes_disponibles(
          Number(idAlmacenEntrega),
          ids,
        );
        if (res.success) {
          const grouped = res.data.reduce(
            (
              acc: Record<number, RES_LoteDisponible[]>,
              lote: RES_LoteDisponible,
            ) => {
              if (!acc[lote.id_producto]) acc[lote.id_producto] = [];
              acc[lote.id_producto].push(lote);
              return acc;
            },
            {},
          );
          setLotesPorProducto(grouped);
          // Reiniciamos cantidades al cambiar de almacén o detalles
          setReposicionCantidades({});
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingLotes(false);
      }
    };

    fetchLotes();
  }, [idAlmacenEntrega, selectedDetalles]);

  const handleUpdateLoteQuantity = (
    idDetalle: number,
    idLote: number,
    valBase: number,
  ) => {
    setReposicionCantidades((prev) => {
      const currentDetail = prev[idDetalle] || {};
      return {
        ...prev,
        [idDetalle]: {
          ...currentDetail,
          [idLote]: valBase,
        },
      };
    });
  };

  const handleCrearPersonal = async (dto: {
    nombre: string;
    apellido?: string;
    dni?: string;
  }) => {
    try {
      const res = await AuxService.crear_personal_externo(dto);
      if (res.success) {
        notifySuccess("Personal registrado correctamente");
        const nuevo = res.data as unknown as RES_PersonalExterno;
        setPersonal((prev) => [
          ...prev,
          {
            value: String(nuevo.id_personal),
            label: `${nuevo.nombre_completo} - DNI: ${nuevo.dni || "S/N"}`,
          },
        ]);
        setIdPersonalRecibe(String(nuevo.id_personal));
        return true;
      }
      return false;
    } catch {
      notifyError("Error al registrar personal externo");
      return false;
    }
  };

  const handleConfirmar = async () => {
    if (!idAlmacenEntrega || !idPersonalRecibe || !usuario) return;

    setErrorLocal(null);
    setIsProcessing(true);

    try {
      const itemsFinal: REQ_DetalleReposicionItem[] = [];

      selectedDetalles.forEach((detalle) => {
        const lotesAsignados =
          reposicionCantidades[detalle.id_prestamo_detalle] || {};
        const lotesProd = lotesPorProducto[detalle.id_producto] || [];

        Object.entries(lotesAsignados).forEach(([idLoteStr, cantBase]) => {
          if (cantBase <= 0) return;

          const idLote = Number(idLoteStr);
          const lote = lotesProd.find((l) => l.id_lote === idLote);
          const factor = Number(detalle.contenido_por_presentacion || 1);
          const factorLote = Number(lote?.contenido_por_presentacion || 1);

          const cantPrestamo = cantBase / factor;
          const cantLote = cantBase / factorLote;

          itemsFinal.push({
            id_prestamo_detalle: detalle.id_prestamo_detalle,
            id_lote_producto: idLote,
            cantidad_prestamo: cantPrestamo,
            cantidad_base: cantBase,
            cantidad_lote: cantLote,
          });
        });
      });

      if (itemsFinal.length === 0) {
        throw new Error("Debe ingresar al menos una cantidad a reponer.");
      }

      const payload = {
        id_prestamo_almacen: idPrestamo,
        id_almacen_entrega: Number(idAlmacenEntrega),
        id_empleado_registro: usuario.id_empleado,
        id_personal_recibe: Number(idPersonalRecibe),
        fecha_hora_reposicion: new Date().toISOString(),
        items: itemsFinal,
        observacion: observacion.trim() || undefined,
        evidencias,
      };

      const res = await PrestamosService.registrarReposicion(payload);
      if (res.success) {
        notifySuccess(res.message);
        onSuccess();
      } else {
        setErrorLocal(res.message);
      }
    } catch (error) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Error al procesar la reposición";
      setErrorLocal(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    loadingAlmacenes,
    loadingPersonal,
    loadingLotes,
    almacenesPrincipales,
    personal,
    idAlmacenEntrega,
    setIdAlmacenEntrega,
    idPersonalRecibe,
    setIdPersonalRecibe,
    lotesPorProducto,
    reposicionCantidades,
    handleUpdateLoteQuantity,
    handleCrearPersonal,
    handleConfirmar,
    isProcessing,
    errorLocal,
    evidencias,
    setEvidencias,
    observacion,
    setObservacion,
  };
};
