import {
  Stack,
  Text,
  Button,
  Group,
  Select,
  Paper,
  Switch,
  Alert,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import dayjs from "dayjs";
import { useRegistroRecepcion } from "../hooks/useRegistroRecepcion";
import type { RES_DetalleEntregaReabastecimiento } from "../service/reabastecimiento.responses";
import { formatNumber } from "../../../presentation/functions/formatNumber";
import {
  ArchiveBoxIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface Props {
  idEntrega: number;
  detalles: RES_DetalleEntregaReabastecimiento[];
  onSuccess: () => void;
}

export const RegistroRecepcion = ({
  idEntrega,
  detalles,
  onSuccess,
}: Props) => {
  const { form, loadingAction, loadingLotes, lotesDestino, handleSubmit } =
    useRegistroRecepcion({
      idEntrega,
      detalles,
      onSuccess,
    });

  return (
    <form onSubmit={handleSubmit} className="font-sans space-y-4">
      <Stack gap="xl">
        {detalles.map((detalle, index) => {
          const esNuevoLote = form.values.items[index]?.es_nuevo_lote;
          const lotesDisponibles = lotesDestino.filter(
            (l) => l.id_producto === detalle.id_producto
          );

          const lotesOptions = lotesDisponibles.map((l) => ({
            value: l.id_lote.toString(),
            label: `Lote: ${l.correlativo} (+${formatNumber(
              l.stock_actual
            )} ${l.unidad_medida_abv}) | Vence: ${
              l.fecha_vencimiento
                ? dayjs(l.fecha_vencimiento).format("DD/MM/YYYY")
                : "N/A"
            }`,
          }));

          return (
            <Paper
              key={detalle.id_entrega_detalle}
              p="md"
              radius="lg"
              className="bg-zinc-900/50 border border-zinc-800"
            >
              <Group justify="space-between" mb="sm" align="flex-start">
                <Group gap="sm">
                  <div className="p-2 bg-zinc-800 border border-zinc-700/50 rounded-xl">
                    <ArchiveBoxIcon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <Text size="md" fw={900} className="text-white">
                      {detalle.producto}
                    </Text>
                    <Group gap="md" mt={2}>
                      <Text size="xs" c="dimmed">
                        Entregado:{" "}
                        <span className="text-emerald-400 font-mono font-bold">
                          {formatNumber(detalle.cantidad_lote)}{" "}
                          {detalle.unidad_lote_abv}
                        </span>
                      </Text>
                      <Text size="xs" c="dimmed">
                        Lote origen:{" "}
                        <span className="text-zinc-300 font-bold">
                          {detalle.correlativo}
                        </span>
                      </Text>
                    </Group>
                  </div>
                </Group>

                <Paper
                  p="xs"
                  className="bg-zinc-950/40 border border-zinc-800 rounded-lg"
                >
                  <Group gap="xs">
                    <Text size="xs" fw={700}>
                      Nuevo Lote
                    </Text>
                    <Switch
                      checked={esNuevoLote}
                      onChange={(e) =>
                        form.setFieldValue(
                          `items.${index}.es_nuevo_lote`,
                          e.currentTarget.checked,
                        )
                      }
                      color="indigo"
                      size="sm"
                    />
                  </Group>
                </Paper>
              </Group>

              {!esNuevoLote ? (
                <div className="grid grid-cols-1 md:grid-cols-2 mt-4 space-x-0 md:space-x-4">
                  <Alert
                    variant="light"
                    color="orange"
                    className="py-2"
                    icon={<InformationCircleIcon className="w-4 h-4" />}
                  >
                    Sumará el stock a un lote que usted indique.
                  </Alert>
                  <Select
                    label="Seleccionar Lote Existente"
                    placeholder={
                      loadingLotes
                        ? "Cargando lotes..."
                        : lotesOptions.length > 0
                        ? "Elija un lote"
                        : "No hay lotes disponibles"
                    }
                    data={lotesOptions}
                    disabled={lotesOptions.length === 0 || loadingLotes}
                    searchable
                    clearable
                    size="sm"
                    {...form.getInputProps(`items.${index}.id_lote_existente`)}
                    value={
                      form.values.items[index]?.id_lote_existente?.toString() ||
                      null
                    }
                    onChange={(val) => {
                      form.setFieldValue(
                        `items.${index}.id_lote_existente`,
                        val ? Number(val) : null
                      );
                    }}
                    withAsterisk
                    className="flex-1"
                  />
                </div>
              ) : (
                <Stack gap="xs" mt="md">
                  <Alert
                    variant="light"
                    color="indigo"
                    className="py-2"
                    icon={<InformationCircleIcon className="w-4 h-4" />}
                  >
                    Creará un lote separado en su inventario.
                  </Alert>
                  <Group grow align="flex-start">
                    <DateInput
                      label="Fecha de Vencimiento"
                      placeholder="Opcional"
                      clearable
                      value={
                        form.values.items[index]?.fecha_vencimiento
                          ? new Date(
                              form.values.items[index].fecha_vencimiento!,
                            )
                          : null
                      }
                      onChange={(d: unknown) => {
                        const date =
                          d instanceof Date
                            ? d
                            : typeof d === "string"
                              ? new Date(d)
                              : null;
                        form.setFieldValue(
                          `items.${index}.fecha_vencimiento`,
                          date ? date.toISOString() : null,
                        );
                      }}
                      error={form.errors[`items.${index}.fecha_vencimiento`]}
                      popoverProps={{ withinPortal: true }}
                    />
                  </Group>
                </Stack>
              )}
            </Paper>
          );
        })}
      </Stack>

      <Group justify="flex-end" mt="xl" className="sticky bottom-0 bg-zinc-950 pb-2 pt-4 border-t border-zinc-800">
        <Button
          type="submit"
          loading={loadingAction}
          color="indigo"
          radius="md"
          leftSection={<CheckCircleIcon className="w-5 h-5" />}
        >
          Confirmar Recepción de {detalles.length}{" "}
          {detalles.length === 1 ? "ítem" : "ítems"}
        </Button>
      </Group>
    </form>
  );
};
