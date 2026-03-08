import { Button, Text } from "@mantine/core";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { CustomDatePicker } from "../../../../presentation/utils/date-picker-input";
import type { RES_ResponsableAlmacen } from "../../service/almacenes.responses";

interface NuevoResponsableProps {
  idAlmacen: number;
  nombreAlmacen?: string;
  onSuccess: (responsable: RES_ResponsableAlmacen) => void;
  onCancel: () => void;
}

export const NuevoResponsable = ({
  idAlmacen,
  nombreAlmacen,
  onSuccess,
  onCancel,
}: NuevoResponsableProps) => {
  // Form State
  const [nuevoResponsable, setNuevoResponsable] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(new Date());
  const [assignError, setAssignError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [, setError] = useState("");

  const { asignarResponsable } = useAlmacenes({ setError });

  // Handle Assign
  const handleAsignar = async () => {
    setAssignError("");
    if (!nuevoResponsable || !fechaInicio) {
      setAssignError("Seleccione responsable y fecha de inicio.");
      return;
    }

    // Validate DTO
    const payload = {
      id_almacen: idAlmacen,
      id_empleado: Number(nuevoResponsable),
      fecha_inicio: dayjs(fechaInicio).format("YYYY-MM-DD"),
    };

    const validation = Schema_AsignarResponsableAlmacen.safeParse(payload);
    if (!validation.success) {
      setAssignError("Datos inválidos.");
      return;
    }

    setSubmitting(true);
    const result = await asignarResponsable(validation.data);
    if (result.success) {
      notifications.show({
        title: "Asignado",
        message: "Nuevo responsable registrado.",
        color: "green",
      });
      setNuevoResponsable(null);
      setFechaInicio(new Date());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSuccess(result.data as any as RES_ResponsableAlmacen);
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
        <h3 className="text-white font-bold mb-4">Nueva Asignación</h3>

        <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
          <Text
            size="xs"
            className="text-indigo-300 font-medium uppercase tracking-wide"
          >
            Asignando responsable a:
          </Text>
          <Text size="md" fw={700} className="text-white mt-1">
            {nombreAlmacen}
          </Text>
        </div>

        <div className="space-y-4">
          <SelectEmpleado
            label="Responsable / Jefe"
            placeholder="Buscar empleado..."
            value={nuevoResponsable}
            onChange={(val) => setNuevoResponsable(val)}
            withAsterisk
            error={assignError && !nuevoResponsable ? "Requerido" : undefined}
          />

          <CustomDatePicker
            label="Fecha de Inicio"
            value={fechaInicio}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(val: any) => setFechaInicio(val)}
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
