import { Button, Group, Stack, Text, Badge } from "@mantine/core";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useNotify } from "../../../../../hooks/useNotify";
import { MinasService } from "../../../service/minas.service";
import { CustomDatePicker } from "../../../../../presentation/utils/date-picker-input";
import { ModalEstandar } from "../../../../../presentation/utils/modal-estandar";
import type { RES_Labor } from "../../../service/minas.responses";

interface FinalizarLaborModalProps {
  labor: RES_Labor | null;
  onClose: () => void;
  onSuccess: (laborActualizada: RES_Labor) => void;
}

export const FinalizarLaborModal = ({
  labor,
  onClose,
  onSuccess,
}: FinalizarLaborModalProps) => {
  const { notify } = useNotify();
  const [fechaCierre, setFechaCierre] = useState<Date | null>(null);
  const [isCerrando, setIsCerrando] = useState(false);

  // Fix hydration mismatch: initialize date only on mount
  useEffect(() => {
    if (labor) {
      setFechaCierre(new Date());
    }
  }, [labor]);

  const handleConfirmarCierre = async () => {
    if (!labor || !fechaCierre) return;

    setIsCerrando(true);
    try {
      const res = await MinasService.finalizarLabor({
        id_labor: labor.id_labor,
        fecha_cierre: dayjs(fechaCierre).format("YYYY-MM-DD"),
      });

      if (res.success) {
        notify({ type: "success", content: res.message });
        onSuccess(res.data);
        onClose();
      } else {
        notify({ type: "error", content: res.message });
      }
    } catch {
      notify({ type: "error", content: "Error al finalizar la labor" });
    } finally {
      setIsCerrando(false);
    }
  };

  return (
    <ModalEstandar
      opened={!!labor}
      close={onClose}
      title="Finalizar Labor Operativa"
      size="md"
    >
      <Stack gap="xl" className="py-2">
        <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
          <Text
            size="xs"
            fw={800}
            className="uppercase tracking-widest text-zinc-500 mb-1"
          >
            Labor a cerrar
          </Text>
          <Group gap={8}>
            <Badge
              variant="light"
              color="indigo"
              radius="md"
              className="font-bold border border-indigo-500/20 py-3"
            >
              {labor?.correlativo}
            </Badge>
            <Text fw={800} className="text-white">
              {labor?.nombre || "Sin nombre"}
            </Text>
          </Group>
        </div>

        <div className="space-y-4">
          <CustomDatePicker
            label="Fecha de Cierre (Real)"
            placeholder="Seleccione fecha real de término"
            value={fechaCierre}
            onChange={(val: unknown) => setFechaCierre(val as Date | null)}
            required
            withAsterisk
          />

          {labor?.fecha_fin_estimada && fechaCierre && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                dayjs(fechaCierre).isAfter(labor.fecha_fin_estimada, "day")
                  ? "bg-red-500/5 border-red-500/20 text-red-400"
                  : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
              }`}
            >
              <ClockIcon className="size-5 shrink-0" />
              <div className="flex-1">
                <Text
                  size="xs"
                  fw={800}
                  className="uppercase tracking-widest leading-tight"
                >
                  Estado de cumplimiento
                </Text>
                <Text size="sm" fw={700}>
                  {dayjs(fechaCierre).isAfter(labor.fecha_fin_estimada, "day")
                    ? `Retraso de ${dayjs(fechaCierre).diff(labor.fecha_fin_estimada, "day")} días`
                    : dayjs(fechaCierre).isBefore(labor.fecha_fin_estimada, "day")
                      ? `Adelantado por ${dayjs(labor.fecha_fin_estimada).diff(fechaCierre, "day")} días`
                      : "Finalizado a tiempo (según plan)"}
                </Text>
              </div>
            </div>
          )}
        </div>

        <Group justify="flex-end" gap="md">
          <Button
            variant="subtle"
            color="gray"
            onClick={onClose}
            radius="lg"
          >
            Cancelar
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700"
            loading={isCerrando}
            onClick={handleConfirmarCierre}
            radius="lg"
            leftSection={<CheckCircleIcon className="size-5" />}
          >
            Confirmar Cierre
          </Button>
        </Group>
      </Stack>
    </ModalEstandar>
  );
};
