import { Select, Stack, Text, Textarea, Group, Paper } from "@mantine/core";
import { UserCircleIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

interface ReceptorInfoProps {
  empleados: { value: string; label: string }[];
  idEmpleadoRecibe: string | null;
  setIdEmpleadoRecibe: (val: string | null) => void;
  observacion: string;
  setObservacion: (val: string) => void;
}

export const ReceptorInfo = ({
  empleados,
  idEmpleadoRecibe,
  setIdEmpleadoRecibe,
  observacion,
  setObservacion,
}: ReceptorInfoProps) => {
  return (
    <Paper p="xl" radius="2xl" className="bg-zinc-900/40 border border-zinc-800/60 shadow-inner">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Stack gap="xs">
          <Group gap={6}>
            <UserCircleIcon className="w-4 h-4 text-indigo-400" />
            <Text size="xs" fw={900} className="text-zinc-500 uppercase tracking-widest">Responsable que Recibe</Text>
          </Group>
          <Select
            placeholder="Busque un empleado..."
            data={empleados}
            value={idEmpleadoRecibe}
            onChange={setIdEmpleadoRecibe}
            searchable
            radius="md"
            size="md"
            nothingFoundMessage="No se encontraron empleados"
          />
        </Stack>

        <Stack gap="xs">
          <Group gap={6}>
            <ClipboardDocumentCheckIcon className="w-4 h-4 text-indigo-400" />
            <Text size="xs" fw={900} className="text-zinc-500 uppercase tracking-widest">Observaciones de la Entrega</Text>
          </Group>
          <Textarea
            placeholder="Indique detalles sobre el transporte, guía de remisión u otros..."
            value={observacion}
            onChange={(e) => setObservacion(e.currentTarget.value)}
            radius="md"
            minRows={2}
          />
        </Stack>
      </div>
    </Paper>
  );
};
