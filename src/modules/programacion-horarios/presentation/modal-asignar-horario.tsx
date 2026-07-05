import { useMemo } from "react";
import {
  Stack,
  Group,
  Text,
  Select,
  MultiSelect,
  Switch,
  Button,
  Divider,
  Alert,
  Badge,
  Checkbox,
  Avatar,
} from "@mantine/core";
import {
  CalendarDaysIcon,
  UsersIcon,
  ClockIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { CustomDatePicker } from "../../../presentation/utils/date-picker-input";
import { useAsignarHorario } from "../hooks/useAsignarHorario";
import { useEmpleadosElegibles } from "../hooks/useEmpleadosElegibles";
import type { RES_TurnoLaboral } from "../service/turnos.responses";
import type { RES_EmpleadoElegible } from "../service/programacion.responses";
import { useNotify } from "../../../hooks/useNotify";

interface ModalAsignarHorarioProps {
  opened: boolean;
  close: () => void;
  turnos: RES_TurnoLaboral[];
  onSuccess?: () => void;
}

const NOMBRES_DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const toIso = (v: Date | string | null | undefined): string => {
  if (!v) return "";
  if (v instanceof Date) {
    if (isNaN(v.getTime())) return "";
    return v.toISOString().split("T")[0];
  }
  return v;
};

const formatDMY = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const format12h = (timeStr: string | null | undefined): string => {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hour = parseInt(parts[0], 10);
  const min = parts[1];
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour ? hour : 12;
  const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
  return `${hourStr}:${min} ${ampm}`;
};

export const ModalAsignarHorario = ({
  opened,
  close,
  turnos,
  onSuccess,
}: ModalAsignarHorarioProps) => {
  const { notifyError } = useNotify();
  const { form, setField, toggleDia, reset, loading, handleSubmit } =
    useAsignarHorario(() => {
      onSuccess?.();
      close();
    });

  // Determinar fecha_fin para la consulta de elegibles.
  // Si es indefinido, se envía null (el backend aceptará siempre).
  const fechaFinParaElegibles = form.por_tiempo_indefinido
    ? null
    : toIso(form.fecha_fin) || null;

  const { empleados, loading: loadingEmpleados } = useEmpleadosElegibles(
    opened ? fechaFinParaElegibles : null,
  );

  const empleadosOptions = useMemo(
    () =>
      empleados.map((e: RES_EmpleadoElegible) => ({
        value: String(e.id_empleado),
        label: `${e.nombre_completo}`,
        disabled: !e.puede_cubrir,
        // Propiedades personalizadas que se pasan al renderOption
        puedeCubrir: e.puede_cubrir,
        fechaFinContrato: e.contrato_fecha_fin,
        urlFoto: e.url_foto,
        dni: e.dni,
      })),
    [empleados],
  );

  const handleConfirmar = async () => {
    if (form.id_turno_laboral <= 0) {
      notifyError("Debe seleccionar un turno laboral");
      return;
    }
    if (form.empleados.length === 0) {
      notifyError("Debe seleccionar al menos un empleado");
      return;
    }
    if (!form.por_tiempo_indefinido && !form.fecha_fin) {
      notifyError("Debe indicar una fecha de fin o activar tiempo indefinido");
      return;
    }
    if (form.dias_laborables.split("").filter((c) => c === "1").length === 0) {
      notifyError("Debe marcar al menos un día laborable");
      return;
    }
    await handleSubmit();
  };

  const fieldClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-300 mb-1 font-medium",
  };

  return (
    <ModalEstandar
      opened={opened}
      close={close}
      title="Asignar Horario"
      size="xl"
    >
      <Stack gap="md">
        <Divider label="Turno" labelPosition="left" />

        <Select
          label="Turno Laboral"
          placeholder={
            turnos.length === 0
              ? "Cree primero un turno en 'Registrar Turnos'"
              : "Seleccione un turno"
          }
          data={turnos.map((t) => ({
            value: String(t.id),
            label: `${t.tipo_turno} · ${format12h(t.hora_ingreso)} - ${format12h(t.hora_salida)}`,
          }))}
          value={form.id_turno_laboral > 0 ? String(form.id_turno_laboral) : null}
          onChange={(v) => setField("id_turno_laboral", v ? Number(v) : 0)}
          leftSection={<ClockIcon className="w-4 h-4 text-zinc-500" />}
          classNames={fieldClasses}
          radius="lg"
          size="xs"
          required
          withAsterisk
          searchable
          comboboxProps={{ withinPortal: true }}
          disabled={loading}
        />

        <Divider label="Empleados" labelPosition="left" />

        <Alert
          variant="light"
          color="indigo"
          radius="md"
          icon={<UsersIcon className="w-4 h-4" />}
          styles={{ message: { fontSize: "12px" } }}
        >
          Solo aparecen empleados con <strong>contrato vigente Activo</strong>.
        </Alert>

        <MultiSelect
          label="Empleados Involucrados"
          placeholder="Seleccione uno o varios empleados"
          data={empleadosOptions}
          value={form.empleados.map(String)}
          onChange={(values) =>
            setField(
              "empleados",
              values.map((v) => Number(v)),
            )
          }
          searchable
          clearable
          maxDropdownHeight={320}
          leftSection={<UsersIcon className="w-4 h-4 text-zinc-500" />}
          classNames={fieldClasses}
          radius="lg"
          size="xs"
          comboboxProps={{ withinPortal: true }}
          disabled={loading || loadingEmpleados}
          renderOption={({ option, checked }) => {
            const opt = option as unknown as {
              puedeCubrir?: boolean;
              fechaFinContrato?: string | null;
              urlFoto?: string | null;
              dni?: string | null;
              label: string;
            };
            const node = (
              <Group gap="sm" wrap="nowrap" className="w-full">
                <Avatar
                  src={opt.urlFoto ?? undefined}
                  size={26}
                  radius="xl"
                  color="indigo"
                  variant="light"
                >
                  {opt.label?.[0] ?? "?"}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Text size="xs" fw={600} className="text-zinc-200 truncate">
                    {opt.label}
                  </Text>
                  <Group gap={6} wrap="nowrap">
                    {opt.dni && (
                      <Text size="10px" className="text-zinc-500 font-mono">
                        DNI {opt.dni}
                      </Text>
                    )}
                    {!opt.puedeCubrir && opt.fechaFinContrato && (
                      <Text size="10px" className="text-amber-500 font-medium">
                        • Culmina el {formatDMY(opt.fechaFinContrato)}
                      </Text>
                    )}
                  </Group>
                </div>
                {!opt.puedeCubrir && (
                  <Badge color="orange" variant="light" size="xs">
                    Fuera de rango
                  </Badge>
                )}
                {checked && <Badge color="indigo" variant="filled" size="xs">OK</Badge>}
              </Group>
            );
            return node;
          }}
        />

        <Divider label="Vigencia" labelPosition="left" />

        <Group grow align="flex-start" gap="md">
          <CustomDatePicker
            label="Fecha de Inicio"
            placeholder="Seleccione fecha"
            value={form.fecha_inicio || null}
            onChange={(val) => setField("fecha_inicio", toIso(val))}
            size="xs"
            disabled={loading}
          />
          <CustomDatePicker
            label="Fecha de Fin"
            placeholder="Seleccione fecha"
            value={form.fecha_fin || null}
            onChange={(val) => setField("fecha_fin", toIso(val))}
            size="xs"
            disabled={form.por_tiempo_indefinido || loading}
            minDate={
              form.fecha_inicio
                ? new Date(`${form.fecha_inicio}T00:00:00`)
                : undefined
            }
          />
        </Group>

        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all ${
            form.por_tiempo_indefinido
              ? "bg-indigo-500/10 border-indigo-500/40"
              : "bg-zinc-900/50 border-zinc-800"
          }`}
        >
          <div className="flex flex-col">
            <Text size="sm" fw={700} className="text-zinc-200 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-400" />
              ¿Por tiempo indefinido?
            </Text>
            <Text size="11px" c="dimmed" className="leading-snug">
              Si lo activa, no se solicitará fecha de fin.
            </Text>
          </div>
          <Switch
            checked={form.por_tiempo_indefinido}
            onChange={(e) => {
              const checked = e.currentTarget.checked;
              setField("por_tiempo_indefinido", checked);
              if (checked) {
                setField("fecha_fin", null);
              }
            }}
            color="indigo"
            size="md"
            disabled={loading}
          />
        </div>

        <Divider
          label={
            <Group gap={4}>
              <Text size="xs" fw={500}>Días Laborables (Domingo a Sábado)</Text>
              <Text size="xs" c="red" fw={700}>*</Text>
            </Group>
          }
          labelPosition="left"
        />

        <Group gap="xs" wrap="wrap" className="bg-zinc-900/30 p-2.5 rounded-xl border border-zinc-800/80">
          <Text size="xs" fw={600} className="text-zinc-400 mr-1">Selección rápida:</Text>
          <Button
            size="xs"
            variant="light"
            color="indigo"
            radius="md"
            onClick={() => setField("dias_laborables", "0111110")}
            disabled={loading}
          >
            Lunes a Viernes
          </Button>
          <Button
            size="xs"
            variant="light"
            color="indigo"
            radius="md"
            onClick={() => setField("dias_laborables", "0111111")}
            disabled={loading}
          >
            Lunes a Sábado
          </Button>
          <Button
            size="xs"
            variant="light"
            color="indigo"
            radius="md"
            onClick={() => setField("dias_laborables", "1111111")}
            disabled={loading}
          >
            Lunes a Domingo
          </Button>
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            radius="md"
            onClick={() => setField("dias_laborables", "0000000")}
            disabled={loading}
          >
            Limpiar todo
          </Button>
        </Group>

        <Group grow gap="xs">
          {NOMBRES_DIAS.map((nombre, indice) => {
            const arr = form.dias_laborables.split("");
            const activo = arr[indice] === "1";
            return (
              <div
                key={indice}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-pointer ${
                  activo
                    ? "bg-indigo-500/15 border-indigo-500/50"
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <Checkbox
                  checked={activo}
                  onChange={() => toggleDia(indice)}
                  color="indigo"
                  size="sm"
                  aria-label={nombre}
                  disabled={loading}
                />
                <Text
                  size="10px"
                  fw={600}
                  className={
                    activo ? "text-indigo-300 uppercase tracking-wider" : "text-zinc-500 uppercase tracking-wider"
                  }
                >
                  {nombre.slice(0, 3)}
                </Text>
              </div>
            );
          })}
        </Group>

        {form.empleados.length > 1 && (
          <Alert
            variant="light"
            color="grape"
            radius="md"
            icon={<UsersIcon className="w-4 h-4" />}
            styles={{ message: { fontSize: "12px" } }}
          >
            <strong>Ingreso masivo:</strong> se crearán {form.empleados.length}{" "}
            programaciones individuales (una por empleado) con el mismo turno y
            rango.
          </Alert>
        )}

        {!form.por_tiempo_indefinido && form.fecha_fin && (
          <Text size="xs" c="dimmed" className="flex items-center gap-1">
            <CalendarDaysIcon className="w-3.5 h-3.5" />
            Vigencia calculada: {formatDMY(form.fecha_inicio)} →{" "}
            {formatDMY(form.fecha_fin)}
          </Text>
        )}

        <Group justify="flex-end" mt="md" gap="md">
          <Button
            variant="subtle"
            onClick={() => {
              reset();
              close();
            }}
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
            leftSection={<ClockIcon className="w-4 h-4" />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 px-8"
          >
            Asignar Horario
          </Button>
        </Group>
      </Stack>
    </ModalEstandar>
  );
};