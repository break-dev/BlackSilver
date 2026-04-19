import {
  Stack,
  Text,
  Select,
  Group,
  Paper,
  Button,
  Alert,
  Loader,
  Textarea,
  ActionIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import {
  BuildingStorefrontIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useRegistroReposicion } from "../../../hooks/useRegistroReposicion";
import type { RES_PrestamoDetalle } from "../../../../../service/responses/prestamos/prestamo";
import { MultiFilePicker } from "../../../../../presentation/utils/archivo/multifile-picker";
import { ProductoRepoCard } from "./producto-repo-card";
import { ModalEstandar } from "../../../../../presentation/utils/modal-estandar";
import { FormPersonalExterno } from "../../../../../presentation/utils/form-personal-externo";

interface RegistroReposicionProps {
  idPrestamo: number;
  selectedDetalles: RES_PrestamoDetalle[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const RegistroReposicion = ({
  idPrestamo,
  selectedDetalles,
  onSuccess,
  onCancel,
}: RegistroReposicionProps) => {
  const {
    loadingAlmacenes,
    loadingLotes,
    almacenesPrincipales,
    personal,
    idAlmacenEntrega,
    setIdAlmacenEntrega,
    idPersonalRecibe,
    setIdPersonalRecibe,
    lotesPorProducto,
    reposicionCantidades,
    handleUpdateLoteQuantity,
    handleCrearPersonal,
    handleConfirmar,
    isProcessing,
    errorLocal,
    evidencias,
    setEvidencias,
    observacion,
    setObservacion,
  } = useRegistroReposicion({
    idPrestamo,
    selectedDetalles,
    onSuccess,
  });

  const [opened, { open, close }] = useDisclosure(false);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateNew = async () => {
    if (!nombre.trim()) return;
    setIsSubmitting(true);
    const success = await handleCrearPersonal({ nombre, apellido, dni });
    if (success) {
      close();
      setNombre("");
      setApellido("");
      setDni("");
    }
    setIsSubmitting(false);
  };

  const canSubmit = !!idAlmacenEntrega && !!idPersonalRecibe && !isProcessing;

  return (
    <Stack gap="xl" className="py-2">
      <Paper
        p="md"
        radius="lg"
        className="bg-zinc-900/50 border border-zinc-800"
      >
        <Stack gap="sm">
          <Group gap="xs">
            <BuildingStorefrontIcon className="w-5 h-5 text-indigo-400" />
            <Text
              fw={800}
              size="xs"
              className="text-zinc-100 uppercase tracking-widest"
            >
              Información de la Reposición
            </Text>
          </Group>

          <Group align="flex-start" gap="md">
            <Select
              label="Almacén de Origen (Principal)"
              labelProps={{
                className: "text-zinc-400 font-bold mb-1",
                size: "xs",
              }}
              placeholder="Seleccione el almacén"
              data={almacenesPrincipales.map((a) => ({
                value: String(a.id_almacen),
                label: a.nombre,
              }))}
              value={idAlmacenEntrega}
              onChange={setIdAlmacenEntrega}
              rightSection={loadingAlmacenes ? <Loader size="xs" /> : undefined}
              radius="lg"
              size="sm"
            />
            <div className="flex items-end gap-2 w-full sm:w-[300px]">
              <Select
                className="flex-1"
                label="¿Quién recibe los materiales?"
                labelProps={{
                  className: "text-zinc-400 font-bold mb-1",
                  size: "xs",
                }}
                placeholder="Buscar por Nombre"
                data={personal}
                searchable
                required
                withAsterisk
                value={idPersonalRecibe}
                onChange={setIdPersonalRecibe}
                size="sm"
                radius="lg"
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
              label="Observación"
              labelProps={{
                className: "text-zinc-400 font-bold mb-1",
                size: "xs",
              }}
              placeholder="Comentario opcional..."
              value={observacion}
              onChange={(e) => setObservacion(e.currentTarget.value)}
              radius="lg"
              size="sm"
              autosize
              minRows={2}
              maxRows={2}
              className="flex-1"
            />
          </Group>
        </Stack>
      </Paper>

      <Paper
        p="md"
        radius="lg"
        className="bg-zinc-900/50 border border-zinc-800"
      >
        <MultiFilePicker
          label="Evidencias"
          files={evidencias}
          onFilesChange={setEvidencias}
        />
      </Paper>

      <Stack gap="md">
        <Group gap="xs" px={4}>
          <Text
            fw={800}
            size="xs"
            className="text-zinc-100 uppercase tracking-widest"
          >
            Productos a Reponer
          </Text>
        </Group>

        {selectedDetalles.map((detalle) => (
          <ProductoRepoCard
            key={detalle.id_prestamo_detalle}
            detalle={detalle}
            lotes={lotesPorProducto[detalle.id_producto] || []}
            reposicionCantidades={reposicionCantidades}
            loadingLotes={loadingLotes}
            handleUpdateLoteQuantity={handleUpdateLoteQuantity}
          />
        ))}
      </Stack>

      {errorLocal && (
        <Alert
          icon={<ExclamationCircleIcon className="w-5 h-5" />}
          title="Error en la Reposición"
          color="red"
          variant="light"
          radius="md"
        >
          <Text size="xs" fw={700}>
            {errorLocal}
          </Text>
        </Alert>
      )}

      <Group justify="flex-end" gap="sm">
        <Button
          variant="light"
          color="red"
          radius="md"
          onClick={onCancel}
          leftSection={<XCircleIcon className="w-4 h-4" />}
          disabled={isProcessing}
          size="sm"
          className="font-bold"
        >
          Cancelar
        </Button>
        <Button
          color="indigo"
          radius="md"
          onClick={handleConfirmar}
          loading={isProcessing}
          disabled={!canSubmit}
          leftSection={<CheckCircleIcon className="w-4 h-4" />}
          size="sm"
          className="font-bold shadow-lg shadow-indigo-500/20"
        >
          Registrar Reposición
        </Button>
      </Group>

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
          onSubmit={handleCreateNew}
          isSubmitting={isSubmitting}
        />
      </ModalEstandar>
    </Stack>
  );
};
