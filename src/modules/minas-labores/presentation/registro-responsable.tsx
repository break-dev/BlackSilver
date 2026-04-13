import { Button, Select, Loader, Stack, Group, Box, Text } from "@mantine/core";
import { UserIcon } from "@heroicons/react/24/outline";
import { useRegistroResponsable } from "../hooks/useRegistroResponsable";
import { CustomDatePicker } from "../../../presentation/utils/date-picker-input";
import type { RES_HistorialResponsable } from "../service/minas.responses";

interface Props {
  idMina: number;
  nombreMina?: string;
  onSuccess: (nueva: RES_HistorialResponsable) => void;
}

const inputClasses = {
  input:
    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
  label: "text-zinc-300 mb-1 font-medium",
  dropdown: "bg-zinc-900 border-zinc-800",
  option:
    "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-0.5",
};

export const RegistroResponsable = ({
  idMina,
  nombreMina,
  onSuccess,
}: Props) => {
  const {
    empleadosDisponibles,
    loadingDisponibles,
    idEmpleado,
    setIdEmpleado,
    fechaInicio,
    setFechaInicio,
    formError,
    isSubmitting,
    handleSubmit,
  } = useRegistroResponsable({ idMina, onSuccess, onCancel: () => {} });

  return (
    <Stack
      gap="md"
      className="animate-fade-in p-4 border border-zinc-800 bg-zinc-900/40 rounded-xl"
    >
      {/* Header — igual que Almacenes */}
      <Group gap="sm" align="center">
        <Box className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <UserIcon className="w-4 h-4 text-indigo-400" />
        </Box>
        <Stack gap={0}>
          <Text
            size="xs"
            fw={700}
            className="text-zinc-300 uppercase tracking-wider"
          >
            Nueva Asignación
          </Text>
          <Text size="xs" className="text-zinc-500">
            {nombreMina}
          </Text>
        </Stack>
      </Group>

      {/* Formulario */}
      <div className="space-y-4">
        <Select
          label="Responsable / Jefe"
          placeholder="Seleccione un responsable"
          withAsterisk
          leftSection={<UserIcon className="w-4 h-4 text-zinc-400" />}
          data={empleadosDisponibles.map((e) => ({
            value: String(e.id_empleado),
            label: e.empleado,
          }))}
          value={idEmpleado ? String(idEmpleado) : null}
          onChange={(v) => setIdEmpleado(v ? parseInt(v) : null)}
          searchable
          nothingFoundMessage="Sin empleados disponibles"
          classNames={inputClasses}
          radius="lg"
          disabled={isSubmitting || loadingDisponibles}
          rightSection={loadingDisponibles && <Loader size={14} color="gray" />}
        />

        <CustomDatePicker
          label="Fecha de inicio"
          placeholder="Seleccione fecha"
          value={fechaInicio}
          onChange={(val: any) => setFechaInicio(val)}
          disabled={isSubmitting}
          required
          withAsterisk
        />

        {formError && (
          <Text size="xs" className="text-red-400 font-medium px-1">
            {formError}
          </Text>
        )}

        <div className="flex justify-end pt-2">
          <Button
            size="sm"
            variant="filled"
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 px-6"
            loading={isSubmitting}
            disabled={!idEmpleado || !fechaInicio}
            onClick={handleSubmit}
            radius="lg"
          >
            Asignar Responsable
          </Button>
        </div>
      </div>
    </Stack>
  );
};
