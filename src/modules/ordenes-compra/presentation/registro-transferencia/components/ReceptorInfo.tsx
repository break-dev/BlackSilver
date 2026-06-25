import { Paper, Select, Textarea, Group } from "@mantine/core";
import { MultiFilePicker } from "../../../../../presentation/utils/archivo/multifile-picker";

interface ReceptorInfoProps {
  personal: { value: string; label: string }[];
  idEmpleadoRecibe: string | null;
  setIdEmpleadoRecibe: (val: string | null) => void;
  observacion: string;
  setObservacion: (val: string) => void;
  evidencias: File[];
  setEvidencias: (val: File[]) => void;
}

export const ReceptorInfo = ({
  personal,
  idEmpleadoRecibe,
  setIdEmpleadoRecibe,
  observacion,
  setObservacion,
  evidencias,
  setEvidencias,
}: ReceptorInfoProps) => {
  return (
    <Paper
      p="md"
      radius="lg"
      className="bg-zinc-900/40 border border-zinc-800 shadow-sm"
    >
      <Group align="flex-start" gap="md" className="w-full pb-2">
        <Select
          className="w-full md:w-[320px]"
          label="¿Quién recibe los materiales?"
          placeholder="Buscar por Nombre"
          data={personal}
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
          className="w-full flex-1"
          label="Observación"
          placeholder="Escriba detalles adicionales..."
          value={observacion}
          onChange={(e) => setObservacion(e.currentTarget.value)}
          size="sm"
          radius="lg"
          minRows={1}
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 py-2 min-w-[200px]",
            label: "text-zinc-300 mb-1 font-medium text-sm",
          }}
        />
      </Group>

      <div className="border-t border-zinc-800/50 pt-4 mt-4">
        <MultiFilePicker
          label="Evidencias de Transferencia"
          files={evidencias}
          onFilesChange={setEvidencias}
        />
      </div>
    </Paper>
  );
};
