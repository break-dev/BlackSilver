import { useEffect, useState } from "react";
import {
  Stack,
  Group,
  Select,
  TextInput,
  Textarea,
  Button,
  Divider,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import "@mantine/dates/styles.css";
import { UserPlusIcon, CheckIcon } from "@heroicons/react/24/outline";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { useRegistrarMarcajeManual } from "../hooks/useRegistrarMarcajeManual";
import { AuxService } from "../../../service/auxiliar.service";

interface ModalRegistrarMarcajeManualProps {
  opened: boolean;
  close: () => void;
  onSuccess?: () => void;
  zIndex?: number;
}

export const ModalRegistrarMarcajeManual = ({
  opened,
  close,
  onSuccess,
  zIndex,
}: ModalRegistrarMarcajeManualProps) => {
  const { form, setField, reset, loading, handleSubmit } =
    useRegistrarMarcajeManual(() => {
      onSuccess?.();
      close();
    });

  const [empleadosOptions, setEmpleadosOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  useEffect(() => {
    if (!opened) return;
    let cancelado = false;
    const cargar = async () => {
      try {
        const resp = await AuxService.get_empleados();
        if (cancelado) return;
        if (resp.success) {
          const data = resp.data as Array<{
            id_empleado: number;
            nombre_completo: string;
          }>;
          setEmpleadosOptions(
            data.map((e) => ({
              value: String(e.id_empleado),
              label: e.nombre_completo,
            })),
          );
        }
      } catch (err) {
        console.error(err);
      }
    };
    void cargar();
    return () => {
      cancelado = true;
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const fieldClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-300 mb-1 font-medium",
  };

  const TIPOS_MARCAJE_OPTIONS = [
    { value: "Ingreso", label: "Ingreso" },
    { value: "Salida", label: "Salida" },
  ];

  return (
    <ModalEstandar
      opened={opened}
      close={close}
      title="Registrar Marcaje Manual"
      size="md"
      zIndex={zIndex}
    >
      <Stack gap="md">
        <Divider label="Identificación" labelPosition="left" />

        <Select
          label="Empleado"
          placeholder="Seleccione un empleado..."
          data={empleadosOptions}
          value={form.id_empleado || null}
          onChange={(val) => setField("id_empleado", val ?? "")}
          searchable
          leftSection={<UserPlusIcon className="w-4 h-4 text-zinc-500" />}
          classNames={{
            ...fieldClasses,
            wrapper: "w-full",
          }}
          radius="lg"
          size="xs"
          comboboxProps={{ withinPortal: true }}
        />

        <Select
          label="Tipo de Marcaje"
          placeholder="Seleccione..."
          data={TIPOS_MARCAJE_OPTIONS}
          value={form.tipo_marcaje || null}
          onChange={(val) =>
            setField(
              "tipo_marcaje",
              (val as "Ingreso" | "Salida" | null) ?? "",
            )
          }
          classNames={{
            ...fieldClasses,
            wrapper: "w-full",
          }}
          radius="lg"
          size="xs"
        />

        <DateTimePicker
          label="Fecha y hora"
          value={form.fecha_hora ? new Date(form.fecha_hora) : null}
          onChange={(val) => {
            if (!val) {
              setField("fecha_hora", "");
              return;
            }
            const d = new Date(val as unknown as string);
            if (Number.isNaN(d.getTime())) {
              setField("fecha_hora", "");
              return;
            }
            setField(
              "fecha_hora",
              d.toISOString().slice(0, 19).replace("T", " "),
            );
          }}
          valueFormat="YYYY-MM-DD HH:mm:ss"
          radius="lg"
          size="xs"
          classNames={fieldClasses}
        />

        <Divider label="Opcionales" labelPosition="left" />

        <TextInput
          label="ID Programación Horario"
          placeholder="Opcional"
          value={form.id_programacion_horario}
          onChange={(e) => setField("id_programacion_horario", e.currentTarget.value)}
          classNames={fieldClasses}
          radius="lg"
          size="xs"
        />

        <Textarea
          label="Observaciones"
          placeholder="Motivo del marcaje manual (opcional)"
          value={form.observaciones}
          onChange={(e) => setField("observaciones", e.currentTarget.value)}
          maxLength={500}
          autosize
          minRows={2}
          classNames={fieldClasses}
          radius="lg"
          size="xs"
        />

        <Group justify="flex-end" gap="sm" mt="sm">
          <Button
            variant="default"
            className="!bg-zinc-800 hover:!bg-zinc-700 !text-zinc-300 !border-zinc-700"
            radius="lg"
            size="xs"
            onClick={() => {
              reset();
              close();
            }}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            leftSection={<CheckIcon className="w-4 h-4" />}
            onClick={handleSubmit}
            loading={loading}
            radius="lg"
            size="xs"
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
          >
            Registrar Marcaje
          </Button>
        </Group>
      </Stack>
    </ModalEstandar>
  );
};

export default ModalRegistrarMarcajeManual;