import { useEffect } from "react";
import { Button, Select, Text } from "@mantine/core";
import { ArrowLeftIcon, UserIcon } from "@heroicons/react/24/outline";
import type { IMessage } from "../../../shared/enums/message";
import type { RES_ResponsableAlmacen } from "../service/almacenes.responses";
import { useNuevoResponsable } from "../hooks/useNuevoResponsable";
import { CustomDatePicker } from "../../../presentation/utils/date-picker-input";

interface NuevoResponsableProps {
  idAlmacen: number;
  nombreAlmacen?: string;
  onMessage?: (msg: IMessage) => void;
  onSuccess: (responsable: RES_ResponsableAlmacen) => void;
  onCancel: () => void;
}

export const NuevoResponsable = ({
  idAlmacen,
  nombreAlmacen,
  onMessage,
  onSuccess,
  onCancel,
}: NuevoResponsableProps) => {
  const {
    empleadosOptions,
    empleadoSeleccionado,
    setEmpleadoSeleccionado,
    fechaInicio,
    setFechaInicio,
    formError,
    loading,
    message,
    asignar,
  } = useNuevoResponsable(idAlmacen);

  // Burbujear mensajes hacia el hook de la página
  useEffect(() => {
    if (message.type && message.content) onMessage?.(message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  const handleAsignar = async () => {
    const result = await asignar();
    if (result) onSuccess(result);
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
          <Select
            label="Responsable / Jefe"
            placeholder="Buscar empleado..."
            leftSection={<UserIcon className="w-4 h-4 text-zinc-400" />}
            data={empleadosOptions}
            value={empleadoSeleccionado}
            onChange={setEmpleadoSeleccionado}
            disabled={loading}
            withAsterisk
            error={formError && !empleadoSeleccionado ? "Requerido" : undefined}
            searchable
            clearable
            nothingFoundMessage="No se encontraron empleados disponibles"
            radius="lg"
            size="sm"
            maxDropdownHeight={300}
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
              dropdown: "bg-zinc-900 border-zinc-800",
              option:
                "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
              label: "text-zinc-300 mb-1 font-medium",
              description: "text-zinc-500 text-xs",
            }}
          />

          <CustomDatePicker
            label="Fecha de Inicio"
            value={fechaInicio}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(val: any) => setFechaInicio(val)}
            error={formError && !fechaInicio ? "Requerido" : undefined}
            withAsterisk
          />

          {formError && (
            <Text size="xs" c="red">
              {formError}
            </Text>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="default" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button
              variant="filled"
              color="indigo"
              onClick={handleAsignar}
              loading={loading}
            >
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
