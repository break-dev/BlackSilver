import { useState } from "react";
import { Button, Text } from "@mantine/core";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { notifications } from "@mantine/notifications";

import { useMinas } from "../../../../services/minas/useMinas";
import type { RES_ResponsableMina } from "../../../../services/minas/dtos/responses";
import { CustomDatePicker } from "../../../utils/date-picker-input";
import { SelectEmpleado } from "../../../utils/select-empleado";

interface FormAsignarResponsableMinaProps {
  idMina: number;
  nombreMina?: string;
  onCancel: () => void;
  onSuccess: (nuevoResponsable: RES_ResponsableMina) => void;
  excludeEmpleadoId?: number | string | null;
}

export const FormAsignarResponsableMina = ({
  idMina,
  nombreMina,
  onCancel,
  onSuccess,
  excludeEmpleadoId,
}: FormAsignarResponsableMinaProps) => {
  const [nuevoResponsable, setNuevoResponsable] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(new Date());
  const [assignError, setAssignError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { asignarResponsable } = useMinas({ setError: () => {} });

  const handleAsignar = async () => {
    setAssignError("");
    if (!nuevoResponsable || !fechaInicio) {
      setAssignError("Seleccione responsable y fecha de inicio.");
      return;
    }

    setSubmitting(true);
    const result = await asignarResponsable({
      id_mina: idMina,
      id_empleado: Number(nuevoResponsable),
      fecha_inicio: dayjs(fechaInicio).format("YYYY-MM-DD"),
    });

    if (result.success && result.data) {
      notifications.show({
        title: "Asignado",
        message: "Nuevo responsable de mina registrado.",
        color: "green",
      });
      onSuccess(result.data);
    } else {
      setAssignError(result.message || "Error al asignar.");
    }
    setSubmitting(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <Button
        variant="subtle"
        color="gray"
        size="xs"
        leftSection={<ArrowLeftIcon className="w-3 h-3" />}
        onClick={onCancel}
        className="hover:text-white text-zinc-400"
      >
        Volver al historial
      </Button>

      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
        <h3 className="text-white font-bold mb-4">
          Nueva Asignación de Responsable
        </h3>

        <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
          <Text
            size="xs"
            className="text-indigo-300 font-medium uppercase tracking-wide"
          >
            Mina:
          </Text>
          <Text size="md" fw={700} className="text-white mt-1">
            {nombreMina}
          </Text>
        </div>

        <div className="space-y-4">
          <SelectEmpleado
            label="Responsable / Jefe de Mina"
            placeholder="Buscar empleado..."
            value={nuevoResponsable}
            onChange={(val) => setNuevoResponsable(val)}
            withAsterisk
            excludeIds={
              excludeEmpleadoId !== undefined && excludeEmpleadoId !== null
                ? [excludeEmpleadoId]
                : undefined
            }
            error={assignError && !nuevoResponsable ? "Requerido" : undefined}
          />

          <CustomDatePicker
            label="Fecha de Inicio"
            value={fechaInicio}
            onChange={(val: unknown) => setFechaInicio(val as Date)}
            error={assignError && !fechaInicio ? "Requerido" : undefined}
            withAsterisk
          />

          {assignError && (
            <Text size="xs" c="red">
              {assignError}
            </Text>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="default" onClick={onCancel} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              variant="filled"
              color="indigo"
              onClick={handleAsignar}
              loading={submitting}
            >
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
