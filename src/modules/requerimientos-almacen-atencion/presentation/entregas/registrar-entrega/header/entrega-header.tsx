import { Paper, Select, Textarea } from "@mantine/core";
import { MultiFilePicker } from "../../../../../../presentation/utils/archivo/multifile-picker";

interface EntregaHeaderProps {
  empleados: { value: string; label: string }[];
  idEmpleadoRecibe: string | null;
  setIdEmpleadoRecibe: (val: string | null) => void;
  observacion: string;
  setObservacion: (val: string) => void;
  evidencias: File[];
  setEvidencias: React.Dispatch<React.SetStateAction<File[]>>;
}

export const EntregaHeader = ({
  empleados,
  idEmpleadoRecibe,
  setIdEmpleadoRecibe,
  observacion,
  setObservacion,
  evidencias,
  setEvidencias,
}: EntregaHeaderProps) => {
  return (
    <Paper
      p="md"
      radius="lg"
      className="bg-zinc-900/40 border border-zinc-800 shadow-sm"
    >
      <div className="flex flex-col gap-4">
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
            placeholder="Escriba detalles adicionales si es necesario..."
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

        <div className="border-t border-zinc-800/50 pt-4">
          <MultiFilePicker
            label="Evidencias de Entrega"
            files={evidencias}
            onFilesChange={setEvidencias}
          />
        </div>
      </div>
    </Paper>
  );
};
