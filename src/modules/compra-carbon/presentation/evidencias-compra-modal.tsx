import { useState } from "react";
import { Button, Group, Stack, Text } from "@mantine/core";
import { IconCloudUpload } from "@tabler/icons-react";

import { useNotify } from "../../../hooks/useNotify";
import { ArchivoCard } from "../../../presentation/utils/archivo/archivo-card";
import { MultiFilePicker } from "../../../presentation/utils/archivo/multifile-picker";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
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
    if (nuevosFiles.length === 0) {
      // No hay archivos nuevos: cerramos sin invocar al backend.
      // (Los archivos ya existentes no se modifican: el "quitar" local
      // se aplica recien al volver a subir archivos nuevos).
      close();
      return;
    }
    const result = await subirYGuardar(existentes, nuevosFiles);
    if (!result) {
      notifyError("No se pudieron guardar las evidencias nuevas");
      return;
    }
    // Reemplazamos la lista local con la respuesta del backend
    // (incluye los archivos recien subidos) y limpiamos el picker.
    setExistentes(result.cabecera.evidencias ?? []);
    setNuevosFiles([]);
    onSaved?.({
      ...compra,
      evidencias: result.cabecera.evidencias ?? [],
    });
    // El modal queda abierto para que el usuario siga agregando mas.
  };

  return (
    <ModalEstandar
      opened={opened}
      close={close}
      title={`Evidencias · ${compra.correlativo}`}
      size="60rem"
      validateClose
    >
      <Stack gap="md">
        {/* Subida de archivos nuevos (arriba) */}
        <MultiFilePicker
          files={nuevosFiles}
          onFilesChange={setNuevosFiles}
          label="Seleccionar archivos"
          description="Imagenes o documentos (PDF, JPG, PNG, etc.)"
        />

        {/* Archivos ya cargados (abajo) */}
        <div>
          <Text
            size="xs"
            fw={800}
            c="zinc.4"
            className="uppercase tracking-widest mb-2"
          >
            Archivos en la compra ({existentes.length})
          </Text>
          {existentes.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-xl px-3 py-6 text-center">
              <Text size="xs" c="dimmed" fs="italic">
                Aun no hay evidencias cargadas.
              </Text>
            </div>
          ) : (
            <div className="grid grid-cols-3">
              {existentes.map((a) => (
                <ArchivoCard
                  key={a.path_relativo}
                  archivo={a}
                  onRemove={() => handleQuitarExistente(a.path_relativo)}
                />
              ))}
            </div>
          )}
        </div>

        <Group justify="flex-end" pt="sm" className="border-t border-zinc-800">
          <Button
            variant="subtle"
            color="gray"
            onClick={close}
            disabled={loading}
            radius="xl"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            loading={loading}
            disabled={nuevosFiles.length === 0}
            leftSection={<IconCloudUpload size={16} />}
            radius="xl"
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
          >
            Subir y guardar
          </Button>
        </Group>
      </Stack>
    </ModalEstandar>
  );
};