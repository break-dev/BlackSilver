import {
  Button,
  Group,
  NumberInput,
  Stack,
  Textarea,
  Text,
  Badge,
  Card,
  SimpleGrid,
} from "@mantine/core";
//import { DateTimePicker } from "@mantine/dates";
import { useState, useEffect, useMemo } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { ControlUsoService } from "../service/control-uso.service";
import type { RES_ControlUsoLog } from "../service/control-uso.responses";
import type { RES_ActivoFijoDisponible } from "../../../service/responses/activo-fijo";
import { Cog8ToothIcon, TruckIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";

interface Props {
  asset: RES_ActivoFijoDisponible;
  tipoControl: "horometro" | "odometro";
  onSuccess: (nuevoLog: RES_ControlUsoLog) => void;
  onCancel: () => void;
}

export const RegistroUso = ({
  asset,
  tipoControl,
  onSuccess,
  onCancel,
}: Props) => {
  const { notifyError } = useNotify();
  const idActivoFijo = asset.id_activo;

  // Loading states
  const [loadingLectura, setLoadingLectura] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [lecturaInicio, setLecturaInicio] = useState<number>(0);
  const [lecturaFin, setLecturaFin] = useState<number>(0);
  const [precioUnitario, setPrecioUnitario] = useState<number>(0);
  const [observacion, setObservacion] = useState("");

  // Load last meter reading when component mounts or asset changes
  useEffect(() => {
    if (!idActivoFijo) return;

    const fetchUltimaLectura = async () => {
      setLoadingLectura(true);
      try {
        const resp = await ControlUsoService.getUltimoHorometro(idActivoFijo);
        if (resp.success) {
          const ultimoVal = resp.data.ultimo_horometro;
          setLecturaInicio(ultimoVal);
          setLecturaFin(0); // Do not autocomplete final reading
        } else {
          notifyError(resp.message || "No se pudo obtener la última lectura");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLectura(false);
      }
    };

    fetchUltimaLectura();
  }, [idActivoFijo, notifyError]);

  // Dynamic naming based on control type
  const labelLectura = tipoControl === "horometro" ? "Horómetro" : "Odómetro";
  const labelDiferencia = tipoControl === "horometro" ? "Horas" : "Km";
  const unitMeasure = tipoControl === "horometro" ? "hrs" : "Km";

  // Calculations in real time
  const totalUso = useMemo(() => {
    return Math.max(0, lecturaFin - lecturaInicio);
  }, [lecturaInicio, lecturaFin]);

  const costoTotal = useMemo(() => {
    return totalUso * precioUnitario;
  }, [totalUso, precioUnitario]);

  // Handle submit form
  const handleSubmit = async () => {
    if (!idActivoFijo) {
      notifyError("Por favor seleccione un activo fijo.");
      return;
    }

    if (lecturaFin < lecturaInicio) {
      notifyError(
        `La lectura final del ${labelLectura} no puede ser menor a la lectura inicial.`
      );
      return;
    }

    setSaving(true);
    try {
      const ahora = new Date();
      const resp = await ControlUsoService.registrarUso({
        id_activo_fijo: idActivoFijo,
        fecha_hora_inicio_control: dayjs(ahora).format("YYYY-MM-DD HH:mm:ss"),
        fecha_hora_fin_control: null,
        horometro_inicio: lecturaInicio,
        horometro_fin: lecturaFin,
        precio_unitario: precioUnitario,
        observacion: observacion ? observacion.trim() : null,
      });

      if (resp.success) {
        onSuccess(resp.data);
      } else {
        notifyError(resp.message || "Error al registrar el control de uso");
      }
    } catch (err) {
      notifyError("Error de conexión al guardar el registro.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const fieldClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-300 mb-1 font-medium",
  };

  return (
    <Stack gap="md" className="p-1">
      {/* Premium Asset Card */}
      <div className="relative overflow-hidden bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 flex gap-3.5 transition-all">
        {/* Soft decorative background gradient (inspired by Almacenes indigo aura) */}
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />

        {/* Icon Container (inspired by Almacenes indigo boxes) */}
        <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          {tipoControl === "horometro" ? (
            <Cog8ToothIcon className="w-5 h-5 text-indigo-400" />
          ) : (
            <TruckIcon className="w-5 h-5 text-indigo-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">
              Activo Fijo
            </span>
            {/* Correlativo badge (inspired by Almacenes principal pink status) */}
            <Badge size="xs" color="pink" variant="light" className="font-bold shrink-0 border border-pink-500/10">
              {asset.correlativo}
            </Badge>
          </div>
          <Text size="sm" fw={800} className="text-white leading-snug truncate">
            {asset.producto}
          </Text>
          {(asset.almacen || asset.mina) && (
            <Text size="10px" className="text-zinc-500 mt-1.5 flex items-center gap-1.5">
              {/* Location indicator (inspired by Almacenes green responsibles tags) */}
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
              <span className="font-medium">Ubicación:</span>
              <span className="text-zinc-400 font-semibold truncate">
                {asset.almacen || asset.mina}
              </span>
            </Text>
          )}
        </div>
      </div>

      {/* 
      Comentado por requerimiento: Se ocultan los campos de Fecha/Hora de Inicio y Fin.
      La fecha de inicio se registra de forma automática con la hora del sistema al guardar.
      <SimpleGrid cols={2} spacing="md">
        <DateTimePicker
          label="Fecha / Hora Inicio"
          placeholder="Seleccionar inicio..."
          value={fechaInicio}
          onChange={(val) => {
            const nextVal = typeof val === "string" ? (val ? new Date(val) : null) : (val as Date | null);
            setFechaInicio(nextVal);
            if (nextVal && fechaFin) {
              const startDay = new Date(nextVal.getFullYear(), nextVal.getMonth(), nextVal.getDate());
              const endDay = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate());
              if (startDay > endDay) {
                setFechaFin(null);
              }
            }
          }}
          required
          size="xs"
          radius="lg"
          classNames={fieldClasses}
        />
        <DateTimePicker
          label="Fecha / Hora Fin"
          placeholder="Opcional..."
          value={fechaFin}
          onChange={(val) => {
            const nextVal = typeof val === "string" ? (val ? new Date(val) : null) : (val as Date | null);
            if (nextVal && fechaInicio) {
              const startDay = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate());
              const endDay = new Date(nextVal.getFullYear(), nextVal.getMonth(), nextVal.getDate());
              if (endDay < startDay) {
                notifyError("La fecha de fin no puede ser un día anterior al de inicio.");
                return;
              }
            }
            setFechaFin(nextVal);
          }}
          minDate={fechaInicio || undefined}
          size="xs"
          radius="lg"
          classNames={fieldClasses}
        />
      </SimpleGrid>
      */}

      <SimpleGrid cols={3} spacing="md">
        <NumberInput
          label={`${labelLectura} Inicial`}
          value={lecturaInicio}
          onChange={(val) => setLecturaInicio(Number(val))}
          min={0}
          decimalScale={2}
          fixedDecimalScale
          required
          size="xs"
          radius="lg"
          disabled={loadingLectura}
          classNames={fieldClasses}
        />
        <NumberInput
          label={`${labelLectura} Final`}
          value={lecturaFin}
          onChange={(val) => setLecturaFin(Number(val))}
          min={0}
          decimalScale={2}
          fixedDecimalScale
          required
          size="xs"
          radius="lg"
          disabled={loadingLectura}
          classNames={fieldClasses}
        />
        <NumberInput
          label="Precio Unitario"
          value={precioUnitario}
          onChange={(val) => setPrecioUnitario(Number(val))}
          min={0}
          decimalScale={2}
          fixedDecimalScale
          prefix="S/. "
          size="xs"
          radius="lg"
          classNames={fieldClasses}
        />
      </SimpleGrid>

      {/* Real time calculations presentation (WOW Factor) */}
      <Card
        withBorder
        padding="sm"
        radius="lg"
        className="bg-zinc-950/40 border-zinc-800"
      >
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Text size="xs" c="zinc-400" fw={600}>
              Total {labelDiferencia}
            </Text>
            <Group gap={6}>
              <Text size="xl" fw={800} className="text-indigo-400">
                {totalUso.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <Text size="xs" c="zinc-500" className="mt-1.5 italic">
                {unitMeasure}
              </Text>
            </Group>
          </Stack>

          <Stack gap={2} align="flex-end">
            <Text size="xs" c="zinc-400" fw={600}>
              Costo Operativo Total
            </Text>
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: "indigo.5", to: "indigo.8" }}
              radius="lg"
              fw={800}
              h={32}
              className="px-4"
            >
              S/. {costoTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Badge>
          </Stack>
        </Group>
      </Card>

      <Textarea
        label="Observación"
        placeholder="Ingrese notas u observaciones..."
        value={observacion}
        onChange={(e) => setObservacion(e.target.value)}
        size="xs"
        radius="lg"
        minRows={2}
        classNames={fieldClasses}
      />

      <Group justify="flex-end" mt="lg" gap="xs">
        <Button
          variant="subtle"
          color="zinc.5"
          onClick={onCancel}
          disabled={saving}
          size="xs"
          radius="lg"
        >
          Cancelar
        </Button>
        <Button
          color="blue.6"
          onClick={handleSubmit}
          disabled={!idActivoFijo}
          loading={saving}
          size="xs"
          radius="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-900/20"
        >
          Registrar Uso
        </Button>
      </Group>
    </Stack>
  );
};

export default RegistroUso;
