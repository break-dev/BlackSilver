import {
  Paper,
  Select,
  Textarea,
  FileButton,
  Button,
  Group,
  Text,
  ActionIcon,
} from "@mantine/core";
import { IconUpload, IconTrash, IconFile } from "@tabler/icons-react";

interface ReceptorInfoProps {
  empleados: { value: string; label: string }[];
  idEmpleadoRecibe: string | null;
  setIdEmpleadoRecibe: (val: string | null) => void;
  observacion: string;
  setObservacion: (val: string) => void;
  evidencias: File[];
  setEvidencias: (val: File[]) => void;
}

export const ReceptorInfo = ({
  empleados,
  idEmpleadoRecibe,
  setIdEmpleadoRecibe,
  observacion,
  setObservacion,
  evidencias,
  setEvidencias,
}: ReceptorInfoProps) => {
  const handleRemoveFile = (index: number) => {
    setEvidencias(evidencias.filter((_, i) => i !== index));
  };

  return (
    <Paper
      p="md"
      radius="lg"
      className="bg-zinc-900/40 border border-zinc-800 shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="¿Quién recibe los materiales?"
          placeholder="Buscar por Nombre"
          data={empleados}
          searchable
          required
          withAsterisk
          value={idEmpleadoRecibe}
          onChange={setIdEmpleadoRecibe}
          size="sm"
          radius="lg"
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
            label: "text-zinc-300 mb-1 font-medium text-sm",
          }}
        />
        <Textarea
          label="Observación"
          placeholder="Escriba detalles adicionales..."
          value={observacion}
          onChange={(e) => setObservacion(e.currentTarget.value)}
          size="sm"
          radius="lg"
          minRows={1}
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 py-2",
            label: "text-zinc-300 mb-1 font-medium text-sm",
          }}
        />
      </div>

      <div className="border-t border-zinc-800/50 pt-4 mt-4">
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={500} c="zinc.3">
            Evidencias de Entrega
          </Text>
          <FileButton
            onChange={(files) => setEvidencias([...evidencias, ...files])}
            multiple
          >
            {(props) => (
              <Button
                {...props}
                variant="subtle"
                size="xs"
                color="gray"
                leftSection={<IconUpload size={16} />}
                className="hover:bg-zinc-800 text-zinc-400"
              >
                Subir Archivos
              </Button>
            )}
          </FileButton>
        </Group>

        {evidencias.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {evidencias.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/30 border border-zinc-800"
              >
                <Group gap="xs" wrap="nowrap" className="overflow-hidden">
                  <IconFile size={16} className="text-zinc-500 shrink-0" />
                  <Text size="xs" c="zinc.4" truncate className="max-w-[120px]">
                    {file.name}
                  </Text>
                </Group>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  className="hover:bg-red-500/10"
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </div>
            ))}
          </div>
        ) : (
          <Text size="xs" c="zinc.5" fs="italic">
            No se han adjuntado evidencias.
          </Text>
        )}
      </div>
    </Paper>
  );
};
