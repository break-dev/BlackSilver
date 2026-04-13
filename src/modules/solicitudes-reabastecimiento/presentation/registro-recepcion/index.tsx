import {
  Button,
  Stack,
  Text,
  Group,
  Divider,
  Paper,
  Textarea,
  Checkbox,
  Badge,
  Alert,
  SimpleGrid,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  CalendarDaysIcon,
  ExclamationCircleIcon,
  ArchiveBoxArrowDownIcon,
} from "@heroicons/react/24/outline";
import { useRegistroRecepcion } from "../../hooks/useRegistroRecepcion";
import { ProductoRecepcionCard } from "./components/ProductoRecepcionCard";
import { MultiFilePicker } from "../../../../presentation/utils/archivo/multifile-picker";
import type { RES_TicketLote } from "../../../../service/responses/lote-producto";
import type { RES_SolicitudEntregaDetalle } from "../../../../service/responses/solicitudes-reabastecimiento/solicitud-entrega";

interface Props {
  idAlmacenSolicitante: number;
  detalles: RES_SolicitudEntregaDetalle[];
  idEntrega?: number;
  tipoEntrega?: "Solicitud" | "Prestamo";
  onSuccess: (lotesNuevos?: RES_TicketLote[]) => void;
}

export const RegistroRecepcion = (props: Props) => {
  const {
    groupedItems,
    setLotValue,
    addLot,
    removeLot,
    updateTabularAdjustment,
    getLotError,
    loadingAction,
    handleSubmit,
    unidades,
    loadingUnidades,
    errors,
    isFormValid,
    conIncidencia,
    setConIncidencia,
    observacion,
    setObservacion,
    evidencias,
    setEvidencias,
    fechaHoraRecepcion,
    setFechaHoraRecepcion,
    lotesDisponibles,
    loadingLotes,
  } = useRegistroRecepcion(props);

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="xl" p="md">
        {/* Cabecera de Recepción */}
        <Paper
          p="xl"
          radius="xl"
          className="bg-zinc-900/40 border border-zinc-800 shadow-xl overflow-hidden relative"
        >
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ArchiveBoxArrowDownIcon className="w-40 h-40" />
          </div>

          <Group justify="space-between" mb="xl">
            <Stack gap={0}>
              <Text fw={900} size="xl" className="tracking-tight text-white">
                Datos del Ingreso de Mercancía
              </Text>
              <Text size="xs" c="dimmed" fw={600}>
                Registre los detalles del evento de recepción física.
              </Text>
            </Stack>
            {conIncidencia && (
              <Badge
                color="red"
                variant="filled"
                size="sm"
                radius="xl"
                fw={700}
              >
                INCIDENCIA DETECTADA
              </Badge>
            )}
          </Group>

          <Stack gap="lg">
            {/* Fila 1: Fecha (Izquierda) y Check Incidencia (Derecha) */}
            <SimpleGrid
              cols={{ base: 1, md: 2 }}
              spacing="xl"
              verticalSpacing="md"
            >
              <DateTimePicker
                label="Fecha y Hora de Recepción"
                placeholder="Seleccione cuándo se recibió el envío"
                value={fechaHoraRecepcion}
                onChange={(val) => {
                  if (typeof val === "string") {
                    setFechaHoraRecepcion(new Date(val));
                  } else {
                    setFechaHoraRecepcion(val as Date | null);
                  }
                }}
                required
                leftSection={
                  <CalendarDaysIcon className="w-5 h-5 text-indigo-400" />
                }
                radius="md"
                variant="filled"
              />

              <div className="flex items-center h-full pt-6">
                <Checkbox
                  label={
                    <Stack gap={0}>
                      <Text size="sm" fw={800} className="text-white">
                        Reportar incidencia en este envío
                      </Text>
                      <Text size="xs" c="dimmed">
                        Faltantes, daños o inconsistencias en la carga.
                      </Text>
                    </Stack>
                  }
                  checked={conIncidencia}
                  onChange={(e) => setConIncidencia(e.currentTarget.checked)}
                  color="red"
                  radius="sm"
                  styles={{
                    label: { cursor: "pointer" },
                    input: { cursor: "pointer" },
                  }}
                />
              </div>
            </SimpleGrid>

            {conIncidencia && (
              <Alert
                icon={<ExclamationCircleIcon className="w-5 h-5" />}
                color="red"
                variant="outline"
                mt="sm"
                radius="lg"
                title={
                  <Text size="xs" fw={900}>
                    REQUERIMIENTO DE INCIDENCIA
                  </Text>
                }
              >
                <Text size="xs" fw={500}>
                  Al marcar como incidencia, es obligatorio detallarla en la
                  observación y adjuntar al menos una evidencia.
                </Text>
              </Alert>
            )}

            {/* Fila 2: Observación (Toda la fila) */}
            <Textarea
              label="Observación General"
              placeholder={
                conIncidencia
                  ? "Describa detalladamente la incidencia..."
                  : "Notas adicionales sobre la recepción..."
              }
              value={observacion}
              onChange={(e) => setObservacion(e.currentTarget.value)}
              minRows={3}
              required={conIncidencia}
              error={errors.observacion}
              radius="md"
              variant="filled"
              className="w-full"
            />

            {/* Fila 3: Evidencias (Toda la fila) */}
            <Stack gap="xs" mt="sm">
              <MultiFilePicker
                files={evidencias}
                onFilesChange={setEvidencias}
                maxFiles={5}
                label="Evidencias"
              />
              {errors.evidencias && (
                <Text size="xs" c="red" fw={700} ml={4}>
                  {errors.evidencias}
                </Text>
              )}
            </Stack>
          </Stack>
        </Paper>

        <Divider
          label={
            <Text
              fw={900}
              size="xs"
              className="uppercase tracking-[0.2em] text-indigo-400"
            >
              Detalle de Productos
            </Text>
          }
          labelPosition="center"
          my={1}
          className="opacity-50"
        />

        <Stack gap="lg">
          {groupedItems.map((group, idx) => (
            <ProductoRecepcionCard
              key={group.id_solicitud_reabastecimiento_detalle}
              group={group}
              groupIndex={idx}
              setLotValue={setLotValue}
              addLot={addLot}
              removeLot={removeLot}
              updateTabularAdjustment={updateTabularAdjustment}
              getLotError={getLotError}
              unidades={unidades}
              loadingUnidades={loadingUnidades}
              allLotes={lotesDisponibles}
              loadingLotes={loadingLotes}
              cantidadTotalError={errors[`groups.${idx}.cantidad_total`]}
            />
          ))}
        </Stack>

        <Group justify="flex-end">
          <Button
            type="submit"
            size="xs"
            radius="xl"
            loading={loadingAction}
            disabled={!isFormValid}
            variant="gradient"
            gradient={{ from: "indigo.6", to: "cyan.6" }}
            className="px-10 shadow-lg shadow-indigo-500/20 flex-end"
          >
            Registrar Ingreso de Stock
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
