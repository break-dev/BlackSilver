import { useState } from "react";
import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { IconCheck, IconPaperclip } from "@tabler/icons-react";

import { useNotify } from "../../../hooks/useNotify";
import { ArchivoCard } from "../../../presentation/utils/archivo/archivo-card";
import { MultiFilePicker } from "../../../presentation/utils/archivo/multifile-picker";
import { useEvidenciasCompraCarbon } from "../hooks/useEvidenciasCompraCarbon";
import type { IArchivo } from "../../../shared/interfaces/archivo";
import type { CompraCarbonResumen } from "../service/compra-carbon.responses";

interface Props {
  opened: boolean;
  close: () => void;
  compra: CompraCarbonResumen;
  onSaved?: (cabeceraActualizada: CompraCarbonResumen) => void;
}

export const EvidenciasCompraModal = ({
  opened,
  close,
  compra,
  onSaved,
}: Props) => {
  const { notifyError } = useNotify();
  const { subirYGuardar, loading } = useEvidenciasCompraCarbon(
    compra.id_compra_carbon,
  );

  const [existentes, setExistentes] = useState<IArchivo[]>(
    () => compra.evidencias ?? [],
  );
  const [nuevosFiles, setNuevosFiles] = useState<File[]>([]);

  const handleQuitarExistente = (path: string) => {
    setExistentes((prev) => prev.filter((a) => a.path_relativo !== path));
  };

  const handleGuardar = async () => {
    const result = await subirYGuardar(existentes, nuevosFiles);
    if (!result) return;
    // Actualizamos la lista local con lo que devolvio el backend.
    setExistentes(result.cabecera.evidencias ?? []);
    setNuevosFiles([]);
    // Devolvemos el resumen al padre para que reemplace la fila local.
    onSaved?.({
      ...compra,
      evidencias: result.cabecera.evidencias ?? [],
    });
    notifyError; // type-only reference; real notify happens in hook
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      radius="xl"
      size="xl"
      withCloseButton
      title={
        <Group gap="xs">
          <IconPaperclip size={18} className="text-indigo-400" />
          <Text fw={800} size="sm" className="tracking-widest uppercase">
            Evidencias de aprobacion · {compra.correlativo}
          </Text>
        </Group>
      }
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      classNames={{
        content: "bg-zinc-950 border border-white/10 shadow-2xl shadow-black",
        header:
          "bg-zinc-950 text-white pt-5 pb-4 px-6 border-b border-white/10",
        body: "bg-zinc-950 px-6 pt-3 pb-6",
      }}
    >
      <Stack gap="md">
        {/* Listado de archivos actuales */}
        <div>
          <Text
            size="xs"
            fw={800}
            c="white"
            className="uppercase tracking-widest mb-2"
          >
            Archivos actuales ({existentes.length})
          </Text>
          {existentes.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-xl px-3 py-6 text-center">
              <Text size="xs" c="dimmed" fs="italic">
                Aun no hay evidencias cargadas.
              </Text>
            </div>
          ) : (
            <Stack gap="xs">
              {existentes.map((a) => (
                <ArchivoCard
                  key={a.path_relativo}
                  archivo={a}
                  onRemove={() => handleQuitarExistente(a.path_relativo)}
                />
              ))}
            </Stack>
          )}
        </div>

        {/* Subida de nuevos */}
        <div className="h-px bg-zinc-800" />

        <MultiFilePicker
          files={nuevosFiles}
          onFilesChange={setNuevosFiles}
          label="Agregar archivos"
          description="Imagenes o documentos (PDF, JPG, PNG, etc.)"
        />

        <Group justify="flex-end" pt="sm" border-t border-zinc-800>
          <Button variant="subtle" onClick={close} disabled={loading}>
            Cerrar
          </Button>
          <Button
            onClick={handleGuardar}
            loading={loading}
            disabled={nuevosFiles.length === 0}
            leftSection={<IconCheck size={16} />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
          >
            Guardar evidencias
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
