import { Paper, Textarea, Group } from "@mantine/core";
import { MultiFilePicker } from "../../../../../presentation/utils/archivo/multifile-picker";

import {
  TransporteFields,
  type TransporteData,
} from "../../../../../presentation/utils/transport/transporte-fields";

interface ReceptorInfoProps {
  personal: { value: string; label: string }[];
  transporte: TransporteData;
  onChangeTransporte: (field: keyof TransporteData, value: any) => void;
  observacion: string;
  setObservacion: (val: string) => void;
  evidencias: File[];
  setEvidencias: (val: File[]) => void;
}

export const ReceptorInfo = ({
  personal,
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
