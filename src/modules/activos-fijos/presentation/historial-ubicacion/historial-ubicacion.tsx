import {
  Button,
  Grid,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  Alert,
} from "@mantine/core";
import { DateTimePicker, type DateValue } from "@mantine/dates";
import {
  ExclamationCircleIcon,
  MapIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import type { REQ_ActualizarUbicacion } from "../../service/activos.requests";
import type { RES_ActivoFijoResumen } from "../../service/activos.responses";
import { MovimientoActivoFijo } from "../../../../shared/enums/activo-fijo";
import { useMoverActivo } from "../../hooks/useMoverActivo";

interface Props {
  activo: RES_ActivoFijoResumen;
  onSuccess: () => void;
  onCancel: () => void;
}

export const HistorialUbicacionActivo = ({
  activo,
  onSuccess,
  onCancel,
}: Props) => {
  const { almacenes, minas, loading, actualizarUbicacion } = useMoverActivo();

  const [form, setForm] = useState<REQ_ActualizarUbicacion>({
    id_activo: activo.id_activo,
    tipo_movimiento: MovimientoActivoFijo.DeAlmacenAMina,
    id_almacen: null,
    id_mina: null,
    descripcion: "",
    fecha_hora_movimiento: new Date().toISOString(),
  });

  const fieldClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-300 mb-1 font-medium",
  };

  const showAlmacen = [
    MovimientoActivoFijo.DeAlmacenAAlmacen,
    MovimientoActivoFijo.DeMinaAAlmacen,
  ].includes(form.tipo_movimiento as MovimientoActivoFijo);

  const showMina = [
    MovimientoActivoFijo.DeAlmacenAMina,
    MovimientoActivoFijo.DeMinaAMina,
  ].includes(form.tipo_movimiento as MovimientoActivoFijo);

  return (
    <Stack gap="md">
      <Alert
        variant="light"
        color="indigo"
        title="Ubicación Actual"
        icon={<ExclamationCircleIcon className="w-5 h-5" />}
        radius="lg"
      >
        <Text size="xs" fw={600}>
          {activo.mina
            ? `Mina: ${activo.mina}`
            : activo.almacen
              ? `Almacén: ${activo.almacen}`
              : "Sin ubicación registrada"}
        </Text>
      </Alert>

      <Grid gutter="md">
        <Grid.Col span={12}>
          <Select
            label="Tipo de Movimiento"
            placeholder="Seleccione..."
            data={Object.values(MovimientoActivoFijo)}
            value={form.tipo_movimiento}
            onChange={(val) =>
              setForm({
                ...form,
                tipo_movimiento: val as MovimientoActivoFijo,
                id_almacen: null,
                id_mina: null,
              })
            }
            required
            size="xs"
            radius="lg"
            classNames={fieldClasses}
          />
        </Grid.Col>

        {showAlmacen && (
          <Grid.Col span={12}>
            <Select
              label="Almacén Destino"
              placeholder="Seleccione almacén..."
              data={almacenes.map((a) => ({
                value: String(a.id_almacen),
                label: a.nombre,
              }))}
              value={form.id_almacen ? String(form.id_almacen) : null}
              onChange={(val) =>
                setForm({ ...form, id_almacen: val ? Number(val) : null })
              }
              leftSection={<MapPinIcon className="w-4 h-4 text-teal-400" />}
              required
              disabled={loading}
              size="xs"
              radius="lg"
              classNames={fieldClasses}
            />
          </Grid.Col>
        )}

        {showMina && (
          <Grid.Col span={12}>
            <Select
              label="Mina / Labor Destino"
              placeholder="Seleccione mina..."
              data={minas.map((m) => ({
                value: String(m.id_mina),
                label: m.nombre,
              }))}
              value={form.id_mina ? String(form.id_mina) : null}
              onChange={(val) =>
                setForm({ ...form, id_mina: val ? Number(val) : null })
              }
              leftSection={<MapIcon className="w-4 h-4 text-orange-400" />}
              required
              disabled={loading}
              size="xs"
              radius="lg"
              classNames={fieldClasses}
            />
          </Grid.Col>
        )}

        <Grid.Col span={12}>
          <DateTimePicker
            label="Fecha y Hora del Movimiento"
            value={
              form.fecha_hora_movimiento
                ? new Date(form.fecha_hora_movimiento)
                : null
            }
            onChange={(val: DateValue) =>
              setForm({
                ...form,
                fecha_hora_movimiento:
                  val instanceof Date ? val.toISOString() : null,
              })
            }
            size="xs"
            radius="lg"
            classNames={fieldClasses}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Textarea
            label="Motivo / Descripción"
            placeholder="Justificación del movimiento..."
            value={form.descripcion || ""}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            size="xs"
            radius="lg"
            minRows={3}
            classNames={fieldClasses}
          />
        </Grid.Col>
      </Grid>

      <Group justify="flex-end" mt="md">
        <Button
          variant="subtle"
          color="zinc.5"
          onClick={onCancel}
          size="xs"
          radius="lg"
        >
          Cancelar
        </Button>
        <Button
          color="indigo.6"
          onClick={async () => {
            const ok = await actualizarUbicacion(form);
            if (ok) onSuccess();
          }}
          disabled={
            !form.tipo_movimiento ||
            (showAlmacen && !form.id_almacen) ||
            (showMina && !form.id_mina)
          }
          size="xs"
          radius="lg"
        >
          Confirmar Movimiento
        </Button>
      </Group>
    </Stack>
  );
};
