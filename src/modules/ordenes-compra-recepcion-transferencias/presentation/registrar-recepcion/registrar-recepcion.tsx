import {
  Button,
  Stack,
  Text,
  Group,
  Paper,
  Textarea,
  Checkbox,
  Alert,
  SimpleGrid,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  CalendarDaysIcon,
  ExclamationCircleIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { useRegistrarRecepcion } from "../../hooks/useRegistrarRecepcion";
import { RecepcionProductoCard } from "./components/recepcion-producto-card";
import { MultiFilePicker } from "../../../../presentation/utils/archivo/multifile-picker";
import type { RES_OCTransferenciaDetalle } from "../../../../service/responses/ordenes-compra/orden-compra-transferencia";

interface Props {
  idTransferencia: number;
  idAlmacenRecepcionista: number;
  detalles: RES_OCTransferenciaDetalle[];
  onSuccess: () => void;
}

export const RegistrarRecepcionTransferencia = (props: Props) => {
  const {
    groupedItems,
    toggleSelection,
    setLotValue,
    addLot,
    removeLot,
    updateTabularAdjustment,
    getLotError,
    loadingAction,
    handleSubmit,
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
  } = useRegistrarRecepcion({
    idTransferencia: props.idTransferencia,
    idAlmacenRecepcionista: props.idAlmacenRecepcionista,
    detalles: props.detalles,
    onSuccess: props.onSuccess,
  });

  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500 transition-all font-medium",
    label: "text-zinc-400 text-xs font-semibold mb-1.5 ml-1",
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        <Stack gap="xs">
          {/* SECCIÓN: Información General */}
          <Paper
            p="xl"
            radius="xl"
            className="bg-zinc-900/40 border border-zinc-800 shadow-xl relative"
          >
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
                  onChange={(date: Date | null | string) => {
                    const validDate =
                      date instanceof Date
                        ? date
                        : typeof date === "string"
                          ? new Date(date)
                          : null;
                    setFechaHoraRecepcion(validDate);
                  }}
                  radius="md"
                  size="sm"
                  withSeconds={false}
                  leftSection={
                    <CalendarDaysIcon className="w-5 h-5 text-indigo-400" />
                  }
                  classNames={inputClasses}
                  required
                />

                <div className="flex items-center h-full pt-[22px]">
                  <Checkbox
                    label={
                      <Stack gap={0}>
                        <Text
                          size="sm"
                          fw={800}
                          className="text-white tracking-tight"
                        >
                          ¿Existe alguna incidencia en la recepción?
                        </Text>
                        <Text size="xs" c="red.4" className="opacity-70 mt-0.5">
                          Indique si hay daños, faltantes o discrepancias.
                        </Text>
                      </Stack>
                    }
                    checked={conIncidencia}
                    onChange={(e) => setConIncidencia(e.currentTarget.checked)}
                    color="red"
                    size="sm"
                    styles={{
                      label: { cursor: "pointer", paddingLeft: "10px" },
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
                    Es obligatorio detallar la incidencia en los comentarios y
                    adjuntar evidencias.
                  </Text>
                </Alert>
              )}

              {/* Fila 2: Observación (Toda la fila) */}
              <Textarea
                label="Observación y Comentarios"
                placeholder={
                  conIncidencia
                    ? "Describa detalladamente la incidencia..."
                    : "Notas adicionales sobre la recepción..."
                }
                value={observacion}
                onChange={(e) => setObservacion(e.currentTarget.value)}
                minRows={3}
                autosize
                radius="md"
                size="sm"
                classNames={inputClasses}
                required={conIncidencia}
                error={
                  conIncidencia && !observacion.trim()
                    ? "La observación es obligatoria."
                    : null
                }
              />

              {/* Fila 3: Evidencias (Toda la fila) */}
              <Stack gap="xs" mt="sm">
                <MultiFilePicker
                  files={evidencias}
                  onFilesChange={setEvidencias}
                  accept="image/png,image/jpeg,application/pdf"
                />
              </Stack>
            </Stack>
          </Paper>

          {/* SECCIÓN: Productos y Lotes */}
          <section className="space-y-4">
            <Group gap="xs" px={4}>
              <CubeIcon className="w-5 h-5 text-emerald-400" />
              <Text
                fw={800}
                className="text-zinc-100 italic tracking-tight text-lg"
              >
                Items para Ingreso
              </Text>
            </Group>

            <Stack gap="md">
              {groupedItems.map((group, groupIndex) => (
                <RecepcionProductoCard
                  key={`${group.id_detalle_transferencia}-${groupIndex}`}
                  group={group}
                  groupIndex={groupIndex}
                  toggleSelection={() => toggleSelection(groupIndex)}
                  setLotValue={setLotValue}
                  addLot={addLot}
                  removeLot={removeLot}
                  updateTabularAdjustment={updateTabularAdjustment}
                  getLotError={getLotError}
                  allLotes={lotesDisponibles}
                  loadingLotes={loadingLotes}
                  cantidadTotalError={
                    errors[`groups.${groupIndex}.cantidad_total`]
                  }
                />
              ))}
            </Stack>
          </section>
        </Stack>
      </div>

      <div className="border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md p-6 flex justify-end">
        <Button
          type="submit"
          loading={loadingAction}
          disabled={!isFormValid || loadingAction}
          size="sm"
          radius="lg"
          color="indigo"
          className="shadow-xl shadow-indigo-500/10 font-bold px-10"
        >
          Confirmar Recepción
        </Button>
      </div>
    </form>
  );
};
