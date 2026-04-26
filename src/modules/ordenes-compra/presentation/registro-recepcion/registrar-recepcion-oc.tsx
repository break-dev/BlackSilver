import React from "react";
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
  Select,
  TextInput,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  CalendarDaysIcon,
  ExclamationCircleIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useRegistroRecepcionOC } from "../../hooks/useRegistroRecepcionOC";
import { ProductoRecepcionCardOC } from "./components/ProductoRecepcionCardOC";
import { MultiFilePicker } from "../../../../presentation/utils/archivo/multifile-picker";
import type { RES_TicketLote } from "../../../../service/responses/lote-producto";
import type { RES_OrdenCompraDetalle } from "../../../../service/responses/ordenes-compra/orden-compra";

interface Props {
  idOrdenCompra: number;
  detalles: RES_OrdenCompraDetalle[];
  onSuccess: (lotesNuevos?: RES_TicketLote[]) => void;
}

export const RegistroRecepcionOC = (props: Props) => {
  const {
    almacenes,
    selectedAlmacenId,
    setSelectedAlmacenId,
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
    serieGuia,
    setSerieGuia,
    numeroGuia,
    setNumeroGuia,
    lotesDisponibles,
    loadingLotes,
  } = useRegistroRecepcionOC(props);

  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
    dropdown:
      "bg-zinc-950 border-zinc-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl",
    option:
      "text-zinc-300 hover:bg-zinc-800 hover:text-white data-[selected]:bg-indigo-600 data-[selected]:text-white font-medium transition-colors",
    label: "text-zinc-400 mb-0.5 font-bold text-[10px] ",
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={6} p={4}>
        {/* Cabecera de Recepción */}
        <Paper
          p={12}
          radius="lg"
          className="bg-zinc-900/30 border border-zinc-800/80 shadow-md overflow-hidden relative"
        >
          <Stack gap={10}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="Almacén Recepcionista"
                placeholder="Seleccione"
                data={almacenes.map((a) => ({
                  value: a.id_almacen.toString(),
                  label: a.nombre,
                }))}
                value={selectedAlmacenId?.toString()}
                onChange={(val: string | null) =>
                  setSelectedAlmacenId(Number(val))
                }
                required
                radius="md"
                size="xs"
                classNames={inputClasses}
                leftSection={
                  <BuildingStorefrontIcon className="w-4 h-4 text-indigo-400" />
                }
              />

              <DateTimePicker
                label="Fecha y Hora"
                placeholder="Fecha/Hora"
                value={fechaHoraRecepcion}
                onChange={(val) => {
                  if (typeof val === "string") {
                    setFechaHoraRecepcion(new Date(val));
                  } else {
                    setFechaHoraRecepcion(val as Date | null);
                  }
                }}
                required
                radius="md"
                size="xs"
                classNames={inputClasses}
                leftSection={
                  <CalendarDaysIcon className="w-4 h-4 text-indigo-400" />
                }
              />

              <TextInput
                label="Serie Guía"
                placeholder="T001"
                value={serieGuia}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSerieGuia(e.currentTarget.value)
                }
                radius="md"
                size="xs"
                classNames={inputClasses}
                leftSection={
                  <DocumentTextIcon className="w-4 h-4 text-zinc-500" />
                }
              />

              <TextInput
                label="Número Guía"
                placeholder="000001"
                value={numeroGuia}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNumeroGuia(e.currentTarget.value)
                }
                radius="md"
                size="xs"
                classNames={inputClasses}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-10">
                <Textarea
                  label="Observación / Notas"
                  placeholder={
                    conIncidencia
                      ? "Detalle obligatorio de la incidencia..."
                      : "Notas generales de la recepción..."
                  }
                  value={observacion}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setObservacion(e.currentTarget.value)
                  }
                  minRows={2}
                  autosize
                  required={conIncidencia}
                  error={errors.observacion}
                  radius="md"
                  size="xs"
                  classNames={inputClasses}
                />
              </div>
              <div className="md:col-span-2 pt-2">
                <Checkbox
                  label={
                    <Text
                      size="xs"
                      fw={700}
                      className="text-white uppercase tracking-wider"
                    >
                      Incidencia
                    </Text>
                  }
                  checked={conIncidencia}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setConIncidencia(e.currentTarget.checked)
                  }
                  color="red"
                  radius="sm"
                  size="xs"
                />
              </div>
            </div>

            {conIncidencia && (
              <Alert
                icon={<ExclamationCircleIcon className="w-4 h-4" />}
                color="crimson"
                variant="filled"
                radius="md"
                p={5}
                mt={4}
              >
                <Text size="xs" fw={700} className="uppercase tracking-wide">
                  Es obligatorio detallar la incidencia y adjuntar evidencias.
                </Text>
              </Alert>
            )}

            <div className="mt-2">
              <MultiFilePicker
                files={evidencias}
                onFilesChange={setEvidencias}
                maxFiles={5}
                label="Evidencias / Adjuntos"
              />
            </div>
          </Stack>
        </Paper>

        <Divider
          label={
            <Text
              fw={900}
              size="xs"
              className="uppercase tracking-[0.2em] text-indigo-400"
            >
              Productos a Recibir
            </Text>
          }
          labelPosition="center"
          my={10}
          className="opacity-60"
        />

        <Stack gap="sm">
          {groupedItems.map((group, idx) => (
            <ProductoRecepcionCardOC
              key={group.id_orden_compra_detalle}
              group={group}
              groupIndex={idx}
              toggleSelection={() => toggleSelection(idx)}
              setLotValue={setLotValue}
              addLot={addLot}
              removeLot={removeLot}
              updateTabularAdjustment={updateTabularAdjustment}
              getLotError={getLotError}
              allLotes={lotesDisponibles}
              loadingLotes={loadingLotes}
              cantidadTotalError={errors[`groups.${idx}.cantidad_total`]}
            />
          ))}
        </Stack>

        <Group justify="flex-end" gap="xs" mt={20}>
          <Button
            variant="outline"
            color="zinc"
            size="sm"
            radius="md"
            onClick={() => props.onSuccess()}
            disabled={loadingAction}
            className="border-zinc-800 text-zinc-400 hover:bg-zinc-800/50 uppercase font-black tracking-tight"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            color="indigo"
            size="sm"
            radius="md"
            loading={loadingAction}
            disabled={!isFormValid}
            className="shadow-lg shadow-indigo-500/20 uppercase font-black tracking-tight"
          >
            Registrar Recepción
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
