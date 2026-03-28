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
} from "@mantine/core";
import {
  BuildingStorefrontIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useRegistroReposicion } from "../../../hooks/useRegistroReposicion";
import type { RES_PrestamoDetalle } from "../../../service/prestamos.responses";
import { MultiFilePicker } from "../../../../../presentation/utils/MultiFilePicker";
import { ProductoRepoCard } from "./producto-repo-card";

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
    idAlmacenEntrega,
    setIdAlmacenEntrega,
    lotesPorProducto,
    reposicionCantidades,
    handleUpdateLoteQuantity,
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

  const canSubmit = !!idAlmacenEntrega && !isProcessing;

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
              radius="md"
              className="w-full sm:w-[300px]"
              size="sm"
            />
            <Textarea
              label="Observación"
              labelProps={{
                className: "text-zinc-400 font-bold mb-1",
                size: "xs",
              }}
              placeholder="Comentario opcional..."
              value={observacion}
              onChange={(e) => setObservacion(e.currentTarget.value)}
              radius="md"
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
    </Stack>
  );
};
