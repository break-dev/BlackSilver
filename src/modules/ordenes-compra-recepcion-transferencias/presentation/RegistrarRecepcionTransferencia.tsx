import {
  Button,
  Stack,
  Text,
  Group,
  Divider,
  Paper,
  Textarea,
  Checkbox,
  Alert,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  CalendarDaysIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { useRegistrarRecepcion } from "../hooks/useRegistrarRecepcion";
import { ProductoRecepcionCardOCTrans } from "./components/ProductoRecepcionCardOCTrans";
import { MultiFilePicker } from "../../../presentation/utils/archivo/multifile-picker";
import type { RES_TransferenciaOCDetalle } from "../service/oc-recepcion-transferencias.responses";

interface Props {
  idTransferencia: number;
  idAlmacenRecepcionista: number;
  detalles: RES_TransferenciaOCDetalle[];
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-zinc-950">
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <Stack gap="xl" pb={100}>
          {/* SECCIÓN: Información General */}
          <section>
            <Group mb="md" align="center">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <Text size="sm" fw={800} className="text-white tracking-tight">
                  Información de Recepción
                </Text>
                <Text size="xs" c="dimmed" fw={500}>
                  Datos generales del ingreso
                </Text>
              </div>
            </Group>

            <Paper
              shadow="sm"
              radius="lg"
              className="bg-zinc-900/50 border border-zinc-800/80 p-5 overflow-hidden relative"
            >
              <Stack gap="lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <DateTimePicker
                    label="Fecha y Hora de Recepción"
                    placeholder="Seleccione fecha"
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
                    size="sm"
                    radius="md"
                    withSeconds={false}
                    leftSection={
                      <CalendarDaysIcon className="w-4 h-4 text-zinc-400" />
                    }
                    classNames={{
                      input:
                        "bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500",
                      label:
                        "text-zinc-400 font-bold text-xs uppercase tracking-wider mb-1",
                    }}
                    required
                  />
                </div>

                <Divider color="zinc.8" variant="dashed" />

                <div className="space-y-4">
                  <Checkbox
                    label="Reportar incidencia en la recepción"
                    description="Marque esta opción si los productos llegaron dañados, incompletos o no corresponden."
                    checked={conIncidencia}
                    onChange={(e) => setConIncidencia(e.currentTarget.checked)}
                    color="red"
                    size="sm"
                    classNames={{
                      label: "text-white font-bold",
                      description: "text-red-400/80 font-medium text-xs mt-0.5",
                    }}
                  />

                  {conIncidencia && (
                    <Alert
                      icon={<ExclamationCircleIcon className="w-5 h-5" />}
                      title="Incidencia Activada"
                      color="red"
                      variant="light"
                      className="bg-red-950/30 border border-red-900/50"
                      radius="md"
                    >
                      <Text size="xs" fw={500} className="text-red-200">
                        Por favor documente detalladamente el problema y adjunte
                        evidencias fotográficas.
                      </Text>
                    </Alert>
                  )}

                  <Textarea
                    label="Observación General"
                    placeholder="Notas adicionales sobre la recepción..."
                    value={observacion}
                    onChange={(e) => setObservacion(e.currentTarget.value)}
                    minRows={2}
                    autosize
                    radius="md"
                    classNames={{
                      input:
                        "bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500",
                      label:
                        "text-zinc-400 font-bold text-xs uppercase tracking-wider mb-1",
                    }}
                    required={conIncidencia}
                    error={
                      conIncidencia && !observacion.trim()
                        ? "La observación es obligatoria si hay incidencia"
                        : null
                    }
                  />

                  <div>
                    <Text
                      size="xs"
                      fw={800}
                      c="dimmed"
                      className="uppercase tracking-wider mb-2"
                    >
                      Evidencias (Opcional)
                    </Text>
                    <MultiFilePicker
                      files={evidencias}
                      onFilesChange={setEvidencias}
                      accept="image/png,image/jpeg,application/pdf"
                    />
                  </div>
                </div>
              </Stack>
            </Paper>
          </section>

          {/* SECCIÓN: Productos y Lotes */}
          <section>
            <Group mb="md" align="center">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <CubeIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <Text size="sm" fw={800} className="text-white tracking-tight">
                  Productos y Lotes
                </Text>
                <Text size="xs" c="dimmed" fw={500}>
                  Seleccione los productos a recepcionar y asigne lotes
                </Text>
              </div>
            </Group>

            <Stack gap="md">
              {groupedItems.map((group, groupIndex) => (
                <ProductoRecepcionCardOCTrans
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

      <div className="border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-xl p-4 flex justify-end">
        <Button
          type="submit"
          loading={loadingAction}
          disabled={!isFormValid || loadingAction}
          size="md"
          radius="md"
          className="bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Confirmar Recepción
        </Button>
      </div>
    </form>
  );
};
