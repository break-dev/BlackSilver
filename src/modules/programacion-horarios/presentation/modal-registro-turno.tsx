import { useEffect, useRef } from "react";
import {
  Stack,
  Group,
  Select,
  Button,
  NumberInput,
  Alert,
  Divider,
  Badge,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import "@mantine/dates/styles.css";
import {
  ClockIcon,
  SunIcon,
  MoonIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useRegistroTurno } from "../hooks/useRegistroTurno";
import type { RES_TurnoLaboral } from "../service/turnos.responses";
import { TipoTurno } from "../service/tipo-turno";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";

interface ModalRegistroTurnoProps {
  opened: boolean;
  close: () => void;
  turnoEditar?: RES_TurnoLaboral | null;
  onSuccess?: (turno: RES_TurnoLaboral) => void;
  zIndex?: number;
}

const TIPOS_TURNO_OPTIONS = [
  { value: "Dia", label: "Día" },
  { value: "Noche", label: "Noche" },
];

export const ModalRegistroTurno = ({
  opened,
  close,
  turnoEditar,
  onSuccess,
  zIndex,
}: ModalRegistroTurnoProps) => {
  const { form, setField, precargar, reset, loading, handleSubmitCrear, handleSubmitEditar } =
    useRegistroTurno((turno) => {
      onSuccess?.(turno);
      close();
    });

  const refIngreso = useRef<HTMLInputElement>(null);
  const refSalida = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!opened) return;
    if (turnoEditar) {
      precargar(turnoEditar);
    } else {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, turnoEditar]);

  const fieldClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-300 mb-1 font-medium",
  };

  const handleConfirmar = async () => {
    if (turnoEditar) {
      await handleSubmitEditar(turnoEditar.id);
    } else {
      await handleSubmitCrear();
    }
  };

  return (
    <ModalEstandar
      opened={opened}
      close={close}
      title={turnoEditar ? "Editar Turno Laboral" : "Registrar Turno Laboral"}
      size="md"
      zIndex={zIndex}
    >
      <Stack gap="md">
        <Divider label="Tipo y horarios" labelPosition="left" />

        <Select
          label="Tipo de Turno"
          placeholder="Seleccione"
          data={TIPOS_TURNO_OPTIONS}
          value={form.tipo_turno}
          onChange={(val) => setField("tipo_turno", (val as TipoTurno) ?? TipoTurno.Dia)}
          leftSection={
            form.tipo_turno === "Noche" ? (
              <MoonIcon className="w-4 h-4 text-zinc-500" />
            ) : (
              <SunIcon className="w-4 h-4 text-zinc-500" />
            )
          }
          classNames={fieldClasses}
          radius="lg"
          size="xs"
          required
          withAsterisk
          comboboxProps={{ withinPortal: true, zIndex: (zIndex ?? 2000) + 100 }}
          disabled={loading}
        />

        <Group grow align="flex-start" gap="md">
          <TimeInput
            ref={refIngreso}
            label="Hora de Ingreso"
            placeholder="Seleccione hora"
            leftSection={<ClockIcon className="w-4 h-4 text-zinc-500" />}
            value={form.hora_ingreso || undefined}
            onChange={(event) =>
              setField(
                "hora_ingreso",
                event.currentTarget.value
                  ? event.currentTarget.value.slice(0, 5)
                  : "",
              )
            }
            onClick={() => refIngreso.current?.showPicker?.()}
            classNames={fieldClasses}
            radius="lg"
            size="xs"
            required
            withAsterisk
            disabled={loading}
          />
          <TimeInput
            ref={refSalida}
            label="Hora de Salida"
            placeholder="Seleccione hora"
            leftSection={<ClockIcon className="w-4 h-4 text-zinc-500" />}
            value={form.hora_salida || undefined}
            onChange={(event) =>
              setField(
                "hora_salida",
                event.currentTarget.value
                  ? event.currentTarget.value.slice(0, 5)
                  : "",
              )
            }
            onClick={() => refSalida.current?.showPicker?.()}
            classNames={fieldClasses}
            radius="lg"
            size="xs"
            required
            withAsterisk
            disabled={loading}
          />
        </Group>

        {form.total_horas > 0 && (
          <Group justify="center" mt={-8}>
            <Badge
              variant="light"
              color="indigo"
              radius="md"
              size="lg"
              className="font-bold border border-indigo-500/30"
              leftSection={<ClockIcon className="w-3.5 h-3.5" />}
            >
              {form.total_horas.toFixed(2)} horas totales
            </Badge>
          </Group>
        )}

        <NumberInput
          label="Minutos de tolerancia (opcional)"
          placeholder="Ej. 15"
          hideControls
          value={form.minutos_tolerancia ?? ""}
          onChange={(v) =>
            setField(
              "minutos_tolerancia",
              v === "" || v === null ? null : Number(v),
            )
          }
          leftSection={<ClockIcon className="w-4 h-4 text-zinc-500" />}
          classNames={fieldClasses}
          radius="lg"
          size="xs"
          min={0}
          max={1440}
          disabled={loading}
        />

        {form.tipo_turno === "Noche" && (
          <Alert
            variant="light"
            color="indigo"
            radius="md"
            icon={<ExclamationCircleIcon className="w-4 h-4" />}
            styles={{ message: { fontSize: "12px" } }}
          >
            Los turnos <strong>Noche</strong> cruzan medianoche: la hora de salida
            corresponde al día siguiente.
          </Alert>
        )}



        <Group justify="flex-end" mt="md" gap="md">
          <Button
            variant="subtle"
            onClick={close}
            disabled={loading}
            radius="lg"
            size="sm"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
          >
            Cancelar
          </Button>
          <Button
            loading={loading}
            onClick={() => {
              void handleConfirmar();
            }}
            radius="lg"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 px-8"
          >
            {turnoEditar ? "Guardar Cambios" : "Registrar Turno"}
          </Button>
        </Group>
      </Stack>
    </ModalEstandar>
  );
};