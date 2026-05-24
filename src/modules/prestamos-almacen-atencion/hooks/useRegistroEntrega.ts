import { useState, useCallback, useMemo } from "react";
import { PrestamosAtencionService } from "../service/prestamos-atencion.service";
import type { DTO_DetalleEntrega } from "../service/prestamos-atencion.requests";
import { useNotify } from "../../../hooks/useNotify";
import type { RES_LoteDisponible } from "../../../service/responses/lote-producto";
import type { RES_PersonalExterno } from "../../../service/responses/personal-externo";
import type { RES_PrestamoDetalle } from "../../../service/responses/prestamos/prestamo";
import { AuxService } from "../../../service/auxiliar.service";
import { TipoBien } from "../../../shared/enums/_generic/tipo-bien";
import type { RES_ActivoFijoDisponible } from "../../../service/responses/activo-fijo";

interface UseRegistroEntregaProps {
  idAlmacenPrestamista: number;
  selectedItemsIds: number[];
  detallesPrestamo: RES_PrestamoDetalle[];
  idEmpleadoDefault?: number | null;
  onSuccess: () => void;
}

export const useRegistroEntrega = ({
  idAlmacenPrestamista,
  selectedItemsIds,
  detallesPrestamo,
  idEmpleadoDefault,
  onSuccess,
}: UseRegistroEntregaProps) => {
  const { notifySuccess, notifyError } = useNotify();

  const [loading, setLoading] = useState(false);
  const [personal, setPersonal] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [lotes, setLotes] = useState<RES_LoteDisponible[]>([]);
  const [activosFijos, setActivosFijos] = useState<RES_ActivoFijoDisponible[]>(
    [],
  );

  const [idPersonalRecibe, setIdPersonalRecibe] = useState<string | null>(null);
  const [observacion, setObservacion] = useState("");
  const [evidencias, setEvidencias] = useState<File[]>([]);

  // Guardamos: idDetalle -> idLote -> cantidad_base
  const [entregaCantidades, setEntregaCantidades] = useState<
    Record<number, Record<number, number>>
  >({});

  // Guardamos: idDetalle -> idActivo -> cantidad (0 o 1)
  const [entregaCantidadesActivos, setEntregaCantidadesActivos] = useState<
    Record<number, Record<number, number>>
  >({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const itemsAEntregar = useMemo(() => {
    return detallesPrestamo.filter((d) =>
      selectedItemsIds.includes(d.id_prestamo_detalle),
    );
  }, [detallesPrestamo, selectedItemsIds]);

  const detallesConLote = useMemo(
    () => itemsAEntregar.filter((d) => d.tipo_bien !== TipoBien.ActivoFijo),
    [itemsAEntregar],
  );

  const detallesActivoFijo = useMemo(
    () => itemsAEntregar.filter((d) => d.tipo_bien === TipoBien.ActivoFijo),
    [itemsAEntregar],
  );

  const idsProductos = useMemo(() => {
    return Array.from(new Set(detallesConLote.map((d) => d.id_producto)));
  }, [detallesConLote]);

  const idsActivoFijo = useMemo(() => {
    return Array.from(new Set(detallesActivoFijo.map((d) => d.id_producto)));
  }, [detallesActivoFijo]);

  // Cargar Empleados, Lotes y Activos iniciales
  const cargarDatosIniciales = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const promises: Promise<any>[] = [
        AuxService.get_personal_externo(),
        idsProductos.length > 0
          ? AuxService.get_lotes_disponibles(idAlmacenPrestamista, idsProductos)
          : Promise.resolve({ success: true, data: [] }),
        idsActivoFijo.length > 0
          ? AuxService.get_activos_disponibles({
              id_almacen: idAlmacenPrestamista,
              ids_productos: idsActivoFijo,
            })
          : Promise.resolve({ success: true, data: [] }),
      ];

      const [resPers, resLotes, resActivos] = await Promise.all(promises);

      if (resPers.success) {
        const persMapped = resPers.data.map((p: RES_PersonalExterno) => ({
          value: String(p.id_personal),
          label: `${p.nombre_completo} - DNI: ${p.dni || "S/N"}`,
        }));
        setPersonal(persMapped);

        // AUTO-SELECCIÓN: Si tenemos un personal por defecto
        if (idEmpleadoDefault) {
          const exists = persMapped.some(
            (e: { value: string }) => e.value === String(idEmpleadoDefault),
          );
          if (exists) {
            setIdPersonalRecibe(String(idEmpleadoDefault));
          }
        }
      }

      if (resLotes.success) {
        const castedLotes: RES_LoteDisponible[] = resLotes.data.map(
          (l: RES_LoteDisponible) => ({
            ...l,
            stock_actual: Number(l.stock_actual),
            stock_actual_base: Number(l.stock_actual_base),
            contenido_por_presentacion: Number(l.contenido_por_presentacion),
          }),
        );
        setLotes(castedLotes);

        // Inicializar cantidades de lotes
        const initial: Record<number, Record<number, number>> = {};
        detallesConLote.forEach((d) => {
          initial[d.id_prestamo_detalle] = {};
          castedLotes
            .filter((l: RES_LoteDisponible) => l.id_producto === d.id_producto)
            .forEach((l: RES_LoteDisponible) => {
              initial[d.id_prestamo_detalle][l.id_lote] = 0;
            });
        });
        setEntregaCantidades(initial);
      }

      if (resActivos.success) {
        setActivosFijos(resActivos.data);

        // Inicializar cantidades de activos fijos
        const initialActivos: Record<number, Record<number, number>> = {};
        detallesActivoFijo.forEach((d) => {
          initialActivos[d.id_prestamo_detalle] = {};
          resActivos.data
            .filter(
              (a: RES_ActivoFijoDisponible) => a.id_producto === d.id_producto,
            )
            .forEach((a: RES_ActivoFijoDisponible) => {
              initialActivos[d.id_prestamo_detalle][a.id_activo] = 0;
            });
        });
        setEntregaCantidadesActivos(initialActivos);
      }
    } catch {
      setError("Error al cargar datos necesarios");
    } finally {
      setLoading(false);
    }
  }, [
    idsProductos,
    idsActivoFijo,
    idAlmacenPrestamista,
    detallesConLote,
    detallesActivoFijo,
    idEmpleadoDefault,
  ]);

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

  const handleCantLoteChange = useCallback(
    (idDetalle: number, idLote: number, valLote: number) => {
      setEntregaCantidades((prev) => {
        const lote = lotes.find((l) => l.id_lote === idLote);
        if (!lote) return prev;

        const detail = itemsAEntregar.find(
          (d) => d.id_prestamo_detalle === idDetalle,
        );
        if (!detail) return prev;

        const equiv = lote.contenido_por_presentacion || 1;
        const valBase = Number((valLote * equiv).toFixed(4));

        // Validar contra el pendiente del item
        const pendienteBase =
          detail.cantidad_solicitada_base - detail.cantidad_prestada_base;

        // Suma de otros lotes para este mismo item
        const otrosLotesSum = Object.entries(prev[idDetalle] || {}).reduce(
          (acc, [lId, v]) => {
            return Number(lId) === idLote ? acc : acc + (v || 0);
          },
          0,
        );

        // Suma de este mismo lote para otros items
        const otrosItemsSum = Object.entries(prev).reduce(
          (acc, [dId, lotesMap]) => {
            return Number(dId) === idDetalle
              ? acc
              : acc + (lotesMap[idLote] || 0);
          },
          0,
        );

        const disponibleEnLote = lote.stock_actual_base - otrosItemsSum;
        const maxPermitido = Math.min(
          disponibleEnLote,
          pendienteBase - otrosLotesSum,
        );

        const finalValBase = Math.max(0, Math.min(valBase, maxPermitido));

        return {
          ...prev,
          [idDetalle]: {
            ...(prev[idDetalle] || {}),
            [idLote]: finalValBase,
          },
        };
      });
    },
    [lotes, itemsAEntregar],
  );

  const handleCantActivoChange = useCallback(
    (idDetalle: number, idActivo: number, val: number) => {
      setEntregaCantidadesActivos((prev) => {
        const prevCantidades = prev[idDetalle] || {};
        const detail = itemsAEntregar.find(
          (d) => d.id_prestamo_detalle === idDetalle,
        );
        if (!detail) return prev;

        const pendienteMaxDetalle =
          detail.cantidad_solicitada_base - detail.cantidad_prestada_base;

        // Suma de otros activos para este mismo item
        const totalOther = Object.entries(prevCantidades).reduce(
          (sum, [aId, v]) => {
            return Number(aId) === idActivo ? sum : sum + (v || 0);
          },
          0,
        );

        const finalValue = Number(val);
        const maxAllowed = Math.max(
          0,
          Math.min(1, pendienteMaxDetalle - totalOther),
        );
        const safeValue = Math.max(0, Math.min(finalValue, maxAllowed));

        if (prevCantidades[idActivo] === safeValue) return prev;

        return {
          ...prev,
          [idDetalle]: {
            ...prevCantidades,
            [idActivo]: safeValue,
          },
        };
      });
    },
    [itemsAEntregar],
  );

  const totalEntregaGeneralBase = useMemo(() => {
    let total = 0;
    Object.values(entregaCantidades).forEach((lotesMap) => {
      Object.values(lotesMap).forEach((v) => (total += v || 0));
    });
    Object.values(entregaCantidadesActivos).forEach((activosMap) => {
      Object.values(activosMap).forEach((v) => (total += v || 0));
    });
    return total;
  }, [entregaCantidades, entregaCantidadesActivos]);

  const registrarEntrega = useCallback(
    async (idPrestamo: number) => {
      if (!idPersonalRecibe) {
        notifyError("Debe seleccionar el receptor");
        return;
      }

      const detallesParaApi: DTO_DetalleEntrega[] = [];

      // --- Activos Fijos Seleccionados ---
      Object.entries(entregaCantidadesActivos).forEach(
        ([idDet, activosMap]) => {
          const idDetalle = Number(idDet);
          Object.entries(activosMap).forEach(([idA, cant]) => {
            if (cant > 0) {
              detallesParaApi.push({
                id_prestamo_detalle: idDetalle,
                id_activo_fijo: Number(idA),
                cantidad_base: 1,
                cantidad_lote: 1,
                cantidad_solicitud: 1,
              });
            }
          });
        },
      );

      // --- Lotes normales ---
      Object.entries(entregaCantidades).forEach(([idDet, lotesMap]) => {
        const idDetalle = Number(idDet);
        const detail = itemsAEntregar.find(
          (d) => d.id_prestamo_detalle === idDetalle,
        );
        if (!detail) return;

        Object.entries(lotesMap).forEach(([idLot, cantBase]) => {
          if (cantBase > 0) {
            const numIdLote = Number(idLot);
            const lote = lotes.find((l) => l.id_lote === numIdLote);
            if (!lote) return;

            const ratioItem = detail.contenido_por_presentacion || 1;
            const ratioLote = lote.contenido_por_presentacion || 1;

            detallesParaApi.push({
              id_prestamo_detalle: idDetalle,
              id_lote_producto: numIdLote,
              cantidad_base: cantBase,
              cantidad_lote: cantBase / ratioLote,
              cantidad_solicitud: cantBase / ratioItem,
            });
          }
        });
      });

      if (detallesParaApi.length === 0) {
        notifyError("Seleccione al menos un lote o activo para entregar");
        return;
      }

      setSubmitting(true);
      try {
        const res = await PrestamosAtencionService.registrarEntrega(
          {
            id_prestamo: idPrestamo,
            id_personal_recibe: Number(idPersonalRecibe),
            fecha_hora_entrega: undefined, // Backend usará now()
            observacion: observacion || undefined,
            detalles: detallesParaApi,
          },
          evidencias,
        );

        if (res.success) {
          notifySuccess("Entrega registrada correctamente");
          onSuccess();
        } else {
          notifyError(res.message || "Error al registrar la entrega");
        }
      } catch {
        notifyError("Error de conexión");
      } finally {
        setSubmitting(false);
      }
    },
    [
      idPersonalRecibe,
      entregaCantidades,
      entregaCantidadesActivos,
      itemsAEntregar,
      lotes,
      observacion,
      evidencias,
      onSuccess,
      notifyError,
      notifySuccess,
    ],
  );

  return {
    loading,
    itemsAEntregar,
    lotes,
    activosFijos,
    entregaCantidades,
    entregaCantidadesActivos,
    personal,
    idPersonalRecibe,
    setIdPersonalRecibe,
    observacion,
    setObservacion,
    submitting,
    error,
    totalEntregaGeneralBase,
    cargarDatosIniciales,
    handleCantLoteChange,
    handleCantActivoChange,
    registrarEntrega,
    handleCrearPersonal,
    // Evidencias
    evidencias,
    setEvidencias,
  };
};
