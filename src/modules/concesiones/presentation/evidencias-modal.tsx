import {
  Stack,
  Text,
  Button,
  Modal,
  Group,
} from "@mantine/core";
import { PaperClipIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { MultiFilePicker } from "../../../presentation/utils/archivo/multifile-picker";
import { ArchivoCard } from "../../../presentation/utils/archivo/archivo-card";
import type { IArchivo } from "../../../shared/interfaces/archivo";

interface EvidenciasModalProps {
  opened: boolean;
  onClose: () => void;
  titulo: string;
  archivos: IArchivo[];
  onSubir: (files: File[]) => Promise<boolean>;
  onEliminar: (path_relativo: string) => Promise<boolean>;
}

export const EvidenciasModal = ({
  opened,
  onClose,
  titulo,
  archivos,
  onSubir,
  onEliminar,
}: EvidenciasModalProps) => {
  const [nuevos, setNuevos] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);

  const handleClose = () => {
    setNuevos([]);
    onClose();
  };

  const handleSubir = async () => {
    if (nuevos.length === 0) return;
    setSubiendo(true);
    try {
      const ok = await onSubir(nuevos);
      if (ok) setNuevos([]);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      centered
      size="lg"
      radius="xl"
      withCloseButton
      title={
        <Group gap="xs">
          <PaperClipIcon className="w-5 h-5 text-indigo-400" />
          <Text size="sm" fw={700} className="text-zinc-100">
            {titulo}
          </Text>
        </Group>
      }
      classNames={{
        content: "bg-zinc-950 border border-zinc-800/60",
        header: "bg-zinc-950 border-b border-zinc-800/40",
      }}
    >
      <Stack gap="md">
        {archivos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {archivos.map((archivo) => (
              <ArchivoCard
                key={archivo.path_relativo}
                archivo={archivo}
                onRemove={async (a) => {
                  await onEliminar(a.path_relativo);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800/60 rounded-2xl">
            <PaperClipIcon className="w-10 h-10 text-zinc-600 mb-2" />
            <Text size="sm" className="text-zinc-500">
              Sin evidencias registradas
            </Text>
          </div>
        )}

        <div className="h-px bg-zinc-800 my-1" />

        <MultiFilePicker
          files={nuevos}
          onFilesChange={setNuevos}
          label="Agregar más evidencias"
          description="PDF, imágenes o documentos de respaldo"
          accept="image/png,image/jpeg,image/jpg,application/pdf,.docx,.xlsx"
          multiple
        />

        {nuevos.length > 0 && (
          <Group justify="flex-end">
            <Button
              size="sm"
              radius="lg"
              color="indigo"
              loading={subiendo}
              onClick={handleSubir}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
            >
              Guardar Evidencias
            </Button>
          </Group>
        )}
      </Stack>
    </Modal>
  );
};