import { useState, useCallback } from "react";
import { OrdenCompraService } from "../service/orden-compra.service";
import type { RES_OrdenCompraRecepcionDetalle } from "../../../service/responses/ordenes-compra/orden-compra-recepcion";
import type { RES_LoteDisponible } from "../../../service/responses/lote-producto";
import type { RES_PersonalExterno } from "../../../service/responses/personal-externo";
import { useAuthStore } from "../../../stores/auth.store";
import dayjs from "dayjs";
import { AuxService } from "../../../service/auxiliar.service";

export const useRegistroTransferenciaOC = ({
  idAlmacenRecepcionista,
  selectedItemsIds,
  detallesRecepcion,
  onSuccess,
}: {
  idAlmacenRecepcionista: number;
  selectedItemsIds: number[];
  detallesRecepcion: RES_OrdenCompraRecepcionDetalle[];
  onSuccess: (resumen?: Record<number, number>) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [lotes, setLotes] = useState<RES_LoteDisponible[]>([]);
  const [personal, setPersonal] = useState<RES_PersonalExterno[]>([]);
  const [idPersonalRecibe, setIdPersonalRecibe] = useState<string | null>(null);
  const [observacion, setObservacion] = useState("");
  const [evidencias, setEvidencias] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // mapa de cant transferida por lote: { id_recepcion_detalle: { id_lote: cant_base } }
  const [transferenciaCantidades, setTransferenciaCantidades] = useState<
    Record<number, Record<number, number>>
  >({});

  const itemsATransferir = detallesRecepcion.filter((d) =>
    selectedItemsIds.includes(d.id_recepcion_detalle),
  );

  const itemsKey = itemsATransferir
    .map((i) => i.id_recepcion_detalle)
    .join(",");

  const cargarDatosIniciales = useCallback(async () => {
    setLoading(true);
    try {
      const idsProductos = itemsATransferir.map((i) => i.id_producto);

      const lotesRes = await AuxService.get_lotes_disponibles(
        idAlmacenRecepcionista,
        idsProductos,
      );
      if (lotesRes.success && lotesRes.data) {
        setLotes(lotesRes.data);
      }

      const personalRes = await AuxService.get_personal_externo();
      if (personalRes.success && personalRes.data) {
        setPersonal(personalRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [idAlmacenRecepcionista, itemsKey]);

  const handleCantLoteChange = (
    idDetalle: number,
    idLote: number,
    newCant: number,
  ) => {
    setTransferenciaCantidades((prev) => {
      const newState = { ...prev };
      if (!newState[idDetalle]) newState[idDetalle] = {};
      newState[idDetalle][idLote] = newCant;
      if (newCant <= 0) delete newState[idDetalle][idLote];
      return newState;
    });
  };

  const handleCrearPersonal = async (nuevoPersonal: {
    nombre: string;
    apellido?: string;
    dni?: string;
  }) => {
    const res = await AuxService.crear_personal_externo(nuevoPersonal);
    if (res.success && res.data) {
      setPersonal((prev) => [...prev, res.data!]);
      setIdPersonalRecibe(res.data!.id_personal.toString());
    }
  };

  const totalTransferenciaGeneralBase = Object.values(
    transferenciaCantidades,
  ).reduce(
    (acc, loteMap) =>
      acc + Object.values(loteMap).reduce((sum, cant) => sum + cant, 0),
    0,
  );

  const registrarTransferencia = async (
    idRecepcion: number,
    idAlmacenDestino: number,
  ) => {
    if (!idPersonalRecibe) return;

    setSubmitting(true);
    setError(null);

    const detalles = [];
    for (const [idDetalleStr, lotesMap] of Object.entries(
      transferenciaCantidades,
    )) {
      const idDetalle = Number(idDetalleStr);
      for (const [idLoteStr, cant_base] of Object.entries(lotesMap)) {
        if (cant_base > 0) {
          detalles.push({
            id_orden_compra_recepcion_detalle: idDetalle,
            id_lote_producto: Number(idLoteStr),
            cantidad_transferida_base: cant_base,
            comentario: "",
          });
        }
      }
    }

    if (detalles.length === 0) {
      setError("Debe asignar al menos una cantidad a transferir.");
      setSubmitting(false);
      return;
    }

    const payload: Record<string, unknown> = {
      id_orden_compra_recepcion: idRecepcion,
      id_almacen_destino: idAlmacenDestino,
      id_personal_recibe: Number(idPersonalRecibe),
      fecha_hora_transferencia: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      observacion,
      detalles,
    };

    try {
      const user = useAuthStore.getState().usuario;
      payload.id_empleado_transferencia = user?.id_empleado || 1;

      const res = await OrdenCompraService.registrarTransferencia(
        payload,
        evidencias,
      );
      if (res.success) {
        // Calcular resumen de cantidades transferidas por detalle
        const resumen: Record<number, number> = {};
        Object.entries(transferenciaCantidades).forEach(
          ([idDetalleStr, lotesMap]) => {
            const idDetalle = Number(idDetalleStr);
            const total = Object.values(lotesMap).reduce(
              (sum, cant) => sum + cant,
              0,
            );
            if (total > 0) resumen[idDetalle] = total;
          },
        );

        onSuccess(resumen);
      } else {
        setError(res.message);
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Error al transferir");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    loading,
    itemsATransferir,
    lotes,
    transferenciaCantidades,
    personal,
    idPersonalRecibe,
    setIdPersonalRecibe,
    observacion,
    setObservacion,
    evidencias,
    setEvidencias,
    submitting,
    error,
    totalTransferenciaGeneralBase,
    cargarDatosIniciales,
    handleCantLoteChange,
    registrarTransferencia,
    handleCrearPersonal,
  };
};
