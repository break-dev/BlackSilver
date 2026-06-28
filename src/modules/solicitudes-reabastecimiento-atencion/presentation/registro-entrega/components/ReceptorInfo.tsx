import { Group, Loader, Paper, Select, Textarea } from "@mantine/core";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { MultiFilePicker } from "../../../../../presentation/utils/archivo/multifile-picker";

import { TransporteFields, type TransporteData } from "../../../../../presentation/utils/transport/transporte-fields";

interface ReceptorInfoProps {
  almacenesPrincipales: { value: string; label: string }[];
  idAlmacenEntrega: string | null;
  setIdAlmacenEntrega: (val: string | null) => void;
  loadingAlmacenes: boolean;
  personal: { value: string; label: string }[];
  loadingPersonal: boolean;
  transporte: TransporteData;
  onChangeTransporte: (field: keyof TransporteData, value: any) => void;
  observacion: string;
  setObservacion: (val: string) => void;
  evidencias: File[];
  setEvidencias: (files: File[]) => void;
}

export const ReceptorInfo = ({
  almacenesPrincipales,
  idAlmacenEntrega,
  setIdAlmacenEntrega,
  loadingAlmacenes,
  personal,
  loadingPersonal,
  transporte,
  onChangeTransporte,
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
          className="w-full sm:w-[280px]"
          label="Almacén de Salida (Principal)"
          placeholder="Seleccione Almacén"
          data={almacenesPrincipales}
          value={idAlmacenEntrega}
          onChange={setIdAlmacenEntrega}
          disabled={loadingAlmacenes}
          rightSection={
            loadingAlmacenes ? <Loader size="xs" color="indigo" /> : undefined
          }
          required
          withAsterisk
          size="sm"
          radius="lg"
          leftSection={<MapPinIcon className="w-4 h-4 text-zinc-500" />}
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

      <div className="mt-4">
        <TransporteFields
          data={transporte}
          onChange={onChangeTransporte}
          personal={personal}
          loadingPersonal={loadingPersonal}
        />
      </div>

      <div className="border-t border-zinc-800/50 pt-4 mt-4">
        <MultiFilePicker
          label="Evidencias de Entrega"
          files={evidencias}
          onFilesChange={setEvidencias}
        />
      </div>
    </Paper>
  );
};
