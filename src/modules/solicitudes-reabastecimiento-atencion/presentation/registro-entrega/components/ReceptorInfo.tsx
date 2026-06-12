import {
  ActionIcon,
  Group,
  Loader,
  Paper,
  Select,
  Textarea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MapPinIcon, PlusIcon } from "@heroicons/react/24/outline";
import { MultiFilePicker } from "../../../../../presentation/utils/archivo/multifile-picker";
import { ModalEstandar } from "../../../../../presentation/utils/modal-estandar";
import { usePersonalExterno } from "../../../../../hooks/usePersonalExterno";
import type { RES_PersonalExterno } from "../../../../../service/responses/personal-externo";
import { FormPersonalExterno } from "../../../../../presentation/utils/form-personal-externo";

interface ReceptorInfoProps {
  almacenesPrincipales: { value: string; label: string }[];
  idAlmacenEntrega: string | null;
  setIdAlmacenEntrega: (val: string | null) => void;
  loadingAlmacenes: boolean;
  personal: { value: string; label: string }[];
  idPersonalRecibe: string | null;
  setIdPersonalRecibe: (val: string | null) => void;
  loadingPersonal: boolean;
  onAddPersonal?: (nuevo: RES_PersonalExterno) => void;
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
  idPersonalRecibe,
  setIdPersonalRecibe,
  loadingPersonal,
  onAddPersonal,
  observacion,
  setObservacion,
  evidencias,
  setEvidencias,
}: ReceptorInfoProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  const {
    nombre,
    setNombre,
    apellido,
    setApellido,
    dni,
    setDni,
    isSubmitting,
    handleCrearPersonal,
  } = usePersonalExterno({
    autoFetch: false,
    onRegisterSuccess: (nuevo) => {
      onAddPersonal?.(nuevo);
      close();
    },
  });

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
        <div className="flex items-end gap-2 w-full sm:w-[320px]">
          <Select
            className="flex-1"
            label="¿Quién recibe los materiales?"
            placeholder="Buscar por Nombre"
            data={personal}
            searchable
            required
            withAsterisk
            value={idPersonalRecibe}
            onChange={setIdPersonalRecibe}
            disabled={loadingPersonal}
            rightSection={
              loadingPersonal ? <Loader size="xs" color="indigo" /> : undefined
            }
            size="sm"
            radius="lg"
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
              label: "text-zinc-300 mb-1 font-medium text-sm",
            }}
          />
          <ActionIcon
            size="36"
            radius="lg"
            variant="light"
            color="indigo"
            onClick={open}
            title="Agregar nuevo personal"
            className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20"
          >
            <PlusIcon className="w-5 h-5" />
          </ActionIcon>
        </div>
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
          label="Evidencias de Entrega"
          files={evidencias}
          onFilesChange={setEvidencias}
        />
      </div>

      <ModalEstandar
        opened={opened}
        close={close}
        title="Registrar Personal Externo"
      >
        <FormPersonalExterno
          nombre={nombre}
          apellido={apellido}
          dni={dni}
          setNombre={setNombre}
          setApellido={setApellido}
          setDni={setDni}
          onSubmit={handleCrearPersonal}
          isSubmitting={isSubmitting}
        />
      </ModalEstandar>
    </Paper>
  );
};
