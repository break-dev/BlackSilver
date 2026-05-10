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
  Loader,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  CalendarDaysIcon,
  ExclamationCircleIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useRegistroRecepcionOC } from "../../hooks/registro-recepcion/useRegistroRecepcionOC";
import { ProductoRecepcionCardOC } from "./components/ProductoRecepcionCardOC";
import { MultiFilePicker } from "../../../../presentation/utils/archivo/multifile-picker";
import { type DTO_RecepcionOCItem } from "../../service/recepcion.requests";
import type { RES_TicketLote } from "../../../../service/responses/lote-producto";
import type {
  RES_OrdenCompra,
  RES_OrdenCompraDetalle,
} from "../../../../service/responses/ordenes-compra/orden-compra";
import { TipoComprobante } from "../../../../shared/enums/_generic/tipo-comprobante";
import { Switch, NumberInput } from "@mantine/core";
import { MONEDAS } from "../../../../shared/variables/monedas";

interface Props {
  orden: RES_OrdenCompra;
  detalles: RES_OrdenCompraDetalle[];
  soloAutorizados?: boolean;
  onSuccess: (
    lotesNuevos?: RES_TicketLote[],
    finalItems?: DTO_RecepcionOCItem[],
  ) => void;
}

export const RegistroRecepcionOC = (props: Props) => {
  const {
    almacenes,
    loadingAlmacenes,
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
    comprobante,
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
                placeholder={
                  loadingAlmacenes ? "Cargando almacenes..." : "Seleccione"
                }
                data={almacenes.map((a) => ({
                  value: a.id_almacen.toString(),
                  label: a.nombre,
                }))}
                value={selectedAlmacenId?.toString()}
                onChange={(val: string | null) =>
                  setSelectedAlmacenId(Number(val))
                }
                disabled={loadingAlmacenes}
                required
                radius="md"
                size="xs"
                classNames={inputClasses}
                leftSection={
                  <BuildingStorefrontIcon className="w-4 h-4 text-indigo-400" />
                }
                rightSection={
                  loadingAlmacenes ? <Loader size={12} color="indigo" /> : null
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
                px={12}
                py={5}
                mt={4}
                classNames={{
                  wrapper: "items-center gap-2",
                  icon: "mr-0 w-auto",
                }}
              >
                <Text
                  size="xs"
                  fw={700}
                  className="uppercase tracking-wide leading-none"
                >
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

        {/* Sección de Comprobante */}
        <Paper
          p={12}
          radius="lg"
          className="bg-zinc-900/30 border border-zinc-800/80 shadow-md overflow-hidden relative mt-2"
        >
          <Stack gap={10}>
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <DocumentTextIcon className="w-5 h-5 text-indigo-400" />
                <Text
                  fw={900}
                  size="xs"
                  className="uppercase tracking-widest text-white"
                >
                  Comprobante de Pago (Opcional)
                </Text>
              </Group>
              <Switch
                size="xs"
                color="indigo"
                checked={comprobante.incluirComprobante}
                onChange={(e) =>
                  comprobante.setIncluirComprobante(e.currentTarget.checked)
                }
                label={
                  <Text size="xs" fw={700} className="text-zinc-400 uppercase">
                    Vincular ahora
                  </Text>
                }
                classNames={{ track: "bg-zinc-800 border-zinc-700" }}
              />
            </Group>

            {comprobante.incluirComprobante && (
              <Stack gap={10} className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Select
                    label="Tipo"
                    data={Object.values(TipoComprobante)}
                    value={comprobante.tipoComprobante}
                    onChange={(val) =>
                      comprobante.setTipoComprobante(val || "")
                    }
                    radius="md"
                    size="xs"
                    classNames={inputClasses}
                  />
                  <TextInput
                    label="Serie"
                    placeholder="F001"
                    value={comprobante.serie}
                    onChange={(e) =>
                      comprobante.setSerie(e.currentTarget.value)
                    }
                    radius="md"
                    size="xs"
                    classNames={inputClasses}
                  />
                  <TextInput
                    label="Número"
                    placeholder="000001"
                    value={comprobante.numero}
                    onChange={(e) =>
                      comprobante.setNumero(e.currentTarget.value)
                    }
                    radius="md"
                    size="xs"
                    classNames={inputClasses}
                  />
                  <DateTimePicker
                    label="Fecha Emisión"
                    value={comprobante.fechaEmision}
                    onChange={(val) => {
                      if (typeof val === "string") {
                        comprobante.setFechaEmision(val ? new Date(val) : null);
                      } else {
                        comprobante.setFechaEmision(val);
                      }
                    }}
                    radius="md"
                    size="xs"
                    classNames={inputClasses}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Select
                    label="Moneda"
                    data={Object.values(MONEDAS).map((m) => ({
                      value: m.label,
                      label: m.label,
                    }))}
                    value={comprobante.moneda}
                    onChange={(val) => comprobante.setMoneda(val || "Soles")}
                    radius="md"
                    size="xs"
                    disabled
                    classNames={inputClasses}
                  />
                  <NumberInput
                    label="T.C. Venta"
                    value={comprobante.tipoCambio}
                    onChange={(val) =>
                      comprobante.setTipoCambio(Number(val) || 1)
                    }
                    fixedDecimalScale
                    radius="md"
                    size="xs"
                    disabled
                    classNames={inputClasses}
                  />
                  <div className="flex items-end pb-2">
                    <Checkbox
                      label={
                        <Text
                          size="xs"
                          fw={700}
                          className="text-white uppercase"
                        >
                          Auditable
                        </Text>
                      }
                      disabled
                      checked={comprobante.esAuditable}
                      onChange={(e) =>
                        comprobante.setEsAuditable(e.currentTarget.checked)
                      }
                      size="xs"
                    />
                  </div>
                </div>

                <Divider
                  variant="dashed"
                  label="Montos del Comprobante"
                  labelPosition="center"
                  classNames={{
                    label: "text-[9px] uppercase font-bold text-zinc-500",
                  }}
                />

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <NumberInput
                    label="Total Antes IGV"
                    value={comprobante.totalAntesIgv}
                    onChange={(val) =>
                      comprobante.setTotalAntesIgv(Number(val) || 0)
                    }
                    prefix={comprobante.moneda === "Soles" ? "S/ " : "$ "}
                    radius="md"
                    size="xs"
                    classNames={inputClasses}
                    disabled
                  />
                  <div className="flex items-end pb-2">
                    <Checkbox
                      label={
                        <Text
                          size="xs"
                          fw={700}
                          className="text-white uppercase"
                        >
                          Incluye IGV
                        </Text>
                      }
                      disabled
                      checked={comprobante.incluyeIgv}
                      onChange={(e) =>
                        comprobante.setIncluyeIgv(e.currentTarget.checked)
                      }
                      size="xs"
                    />
                  </div>
                  <NumberInput
                    label="% IGV"
                    value={comprobante.porcentajeIgv}
                    onChange={(val) =>
                      comprobante.setPorcentajeIgv(Number(val) || 18)
                    }
                    disabled
                    radius="md"
                    size="xs"
                    classNames={inputClasses}
                  />
                  <NumberInput
                    label="Monto IGV"
                    value={comprobante.montoIgv}
                    onChange={(val) =>
                      comprobante.setMontoIgv(Number(val) || 0)
                    }
                    prefix={comprobante.moneda === "Soles" ? "S/ " : "$ "}
                    radius="md"
                    size="xs"
                    disabled
                    classNames={inputClasses}
                  />
                  <NumberInput
                    label="Total Después IGV"
                    value={comprobante.totalDespuesIgv}
                    onChange={(val) =>
                      comprobante.setTotalDespuesIgv(Number(val) || 0)
                    }
                    prefix={comprobante.moneda === "Soles" ? "S/ " : "$ "}
                    radius="md"
                    size="xs"
                    classNames={inputClasses}
                  />
                </div>

                <div className="mt-2">
                  <MultiFilePicker
                    files={comprobante.evidencias}
                    onFilesChange={comprobante.setEvidencias}
                    maxFiles={3}
                    label="Evidencias del Comprobante"
                  />
                </div>
              </Stack>
            )}
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
            disabled={!isFormValid || loadingAlmacenes}
            className="shadow-lg shadow-indigo-500/20 uppercase font-black tracking-tight"
          >
            Registrar Recepción
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
