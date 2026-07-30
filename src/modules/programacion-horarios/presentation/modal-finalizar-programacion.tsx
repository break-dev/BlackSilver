import { useState } from "react";
import { Stack, Group, Text, Button, Alert } from "@mantine/core";
import { ExclamationTriangleIcon, CalendarDaysIcon, ClockIcon } from "@heroicons/react/24/outline";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import type { RES_ProgramacionHorario } from "../service/programacion.responses";
import { ProgramacionHorarioService } from "../service/programacion.service";
import { useNotify } from "../../../hooks/useNotify";

interface ModalFinalizarProgramacionProps {
  opened: boolean;
  close: () => void;
  programacion: RES_ProgramacionHorario | null;
  fechaSugerida?: string | null;
  onSuccess?: (programacionActualizada: RES_ProgramacionHorario) => void;
}

const formatDMY = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

export const ModalFinalizarProgramacion = ({
  opened,
  close,
  programacion,
  fechaSugerida,
  onSuccess,
}: ModalFinalizarProgramacionProps) => {
  const { notifySuccess, notifyError } = useNotify();
  const fechaFin = fechaSugerida || new Date().toISOString().split("T")[0];
  const [loading, setLoading] = useState(false);



  const handleConfirmar = async () => {
    if (!programacion) return;
    if (!fechaFin) {
      notifyError("Debe seleccionar una fecha de finalización.");
      return;
    }
    if (fechaFin < programacion.fecha_inicio) {
      notifyError("La fecha de finalización no puede ser anterior a la fecha de inicio.");
      return;
    }

    setLoading(true);
    try {
      const resp = await ProgramacionHorarioService.finalizar_programacion(programacion.id, fechaFin);
      if (resp.success && resp.data) {
        notifySuccess(resp.message ?? "Programación finalizada correctamente");
        onSuccess?.(resp.data as RES_ProgramacionHorario);
        close();
      } else {
        notifyError(resp.message ?? "No se pudo finalizar la programación");
      }
    } catch (err) {
      console.error(err);
      notifyError("Error inesperado al finalizar la programación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalEstandar
      opened={opened}
      close={close}
      title="Finalizar Programación"
      size="md"
    >
      <Stack gap="md">
        <Alert
          variant="light"
          color="amber"
          icon={<ExclamationTriangleIcon className="w-5 h-5 text-amber-400" />}
          radius="lg"
          className="bg-amber-500/10 border-amber-500/30"
          classNames={{ message: "text-zinc-200 text-xs leading-relaxed" }}
        >
          <strong>Advertencia de finalización:</strong> Esta acción acotará la vigencia del horario
          del empleado <strong>{programacion?.empleado}</strong>. A partir de la fecha especificada,
          la programación dejará de aplicarse.
        </Alert>

        {programacion && (
          <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 space-y-1">
            <Group justify="space-between">
              <Text size="xs" fw={700} className="text-zinc-200">
                {programacion.empleado}
              </Text>
              <Text size="xs" fw={600} className="text-indigo-400 font-mono">
                {programacion.tipo_turno} ({programacion.hora_ingreso} - {programacion.hora_salida})
              </Text>
            </Group>
            <Text size="11px" className="text-zinc-400 flex items-center gap-1">
              <CalendarDaysIcon className="w-3.5 h-3.5 text-zinc-500" />
              Vigencia actual: {formatDMY(programacion.fecha_inicio)} →{" "}
              {programacion.por_tiempo_indefinido ? "Indefinido" : formatDMY(programacion.fecha_fin)}
            </Text>
          </div>
        )}

        {fechaFin && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl flex items-center justify-between">
            <Text size="xs" fw={600} className="text-rose-200 flex items-center gap-1.5">
              <CalendarDaysIcon className="w-4 h-4 text-rose-400" />
              Nueva fecha de finalización:
            </Text>
            <Text size="xs" fw={700} className="text-rose-400 font-mono bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-800/60">
              {formatDMY(fechaFin)}
            </Text>
          </div>
        )}

        <Group justify="flex-end" mt="sm" gap="md">
          <Button
            variant="subtle"
            onClick={close}
            disabled={loading}
            radius="lg"
            size="sm"
            className="text-zinc-400 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            loading={loading}
            onClick={() => void handleConfirmar()}
            radius="lg"
            size="sm"
            color="rose"
            leftSection={<ClockIcon className="w-4 h-4" />}
            className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-950/20 px-6"
          >
            Confirmar Finalización
          </Button>
        </Group>
      </Stack>
    </ModalEstandar>
  );
};
