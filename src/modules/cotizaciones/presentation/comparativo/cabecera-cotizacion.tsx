import {
  Group,
  Stack,
  Text,
  NumberInput,
  Select,
  MultiSelect,
  Switch,
  ActionIcon,
  TextInput,
  Checkbox,
  Skeleton,
  Popover,
  Tooltip,
} from "@mantine/core";
import {
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  IdentificationIcon,
  TruckIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { CustomDatePicker } from "../../../../presentation/utils/date-picker-input";
import { formatNumber } from "../../../../shared/functions/formatNumber";
import type { DTO_CotizacionRequest } from "../../service/cotizaciones.requests";
import { MetodoPago } from "../../../../shared/enums/_generic/metodo-pago";
import { Estado_Cotizacion } from "../../../../shared/enums/cotizacion/cotizacion";

interface CabeceraCotizacionProps {
  cot?: DTO_CotizacionRequest;
  idx: number;

  proveedores: { id_proveedor: number; razon_social: string }[];
  empresas: { id_empresa: number; razon_social: string }[];
  loadingProveedores?: boolean;
  unidadesMedida: { value: string; label: string; abreviatura: string }[];
  onUpdateHeader: <K extends keyof DTO_CotizacionRequest>(
    index: number,
    field: K,
    value: DTO_CotizacionRequest[K],
  ) => void;
  onRemoveCotizacion: (index: number) => void;
  isSkeleton?: boolean;
}

const inputStyles = {
  input:
    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-600 !font-normal transition-all",
  label: "text-zinc-300 mb-1.5 font-medium text-xs",
  description: "text-zinc-500 text-[10px] italic mt-1 leading-tight",
};

export const CabeceraCotizacion = ({
  cot,
  idx,

  proveedores,
  empresas,
  loadingProveedores,
  onUpdateHeader,
  onRemoveCotizacion,
  isSkeleton = false,
}: CabeceraCotizacionProps) => {
  if (isSkeleton) {
    return (
      <Stack gap={4} className="pt-0 pb-3 px-4 relative">
        <Group justify="space-between" align="center">
          <Skeleton h={16} w={100} radius="md" animate={false} />
        </Group>
        <Stack gap="sm">
          <Skeleton h={32} radius="lg" animate={false} />
          <Group grow gap="md">
            <Skeleton h={32} radius="lg" animate={false} />
            <Skeleton h={32} radius="lg" animate={false} />
          </Group>
          <Skeleton h={32} radius="lg" animate={false} />
          <Group grow gap="xs" mt="md">
            <Skeleton h={40} radius="md" animate={false} />
            <Skeleton h={40} radius="md" animate={false} />
            <Skeleton h={40} radius="md" animate={false} />
          </Group>
        </Stack>
      </Stack>
    );
  }

  // Si no es esqueleto, nos aseguramos de que 'cot' exista para el resto de la lógica
  if (!cot) return null;

  return (
    <Stack gap={4} className="pt-0 pb-3 px-4 relative group-header">
      {/* Título y Cerrar */}
      <Group justify="space-between" align="center">
        <Text
          size="sm"
          fw={800}
          className="text-white tracking-tight uppercase"
        >
          Cotización #{idx + 1}
        </Text>
        <ActionIcon
          variant="subtle"
          color="red"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onRemoveCotizacion(idx)}
        >
          <XMarkIcon className="w-4 h-4" />
        </ActionIcon>
      </Group>

      {/* Configuración Principal */}
      <Stack gap="sm">
        <Group align="flex-end" gap="xs">
          <Select
            placeholder={
              loadingProveedores
                ? "Buscando proveedores..."
                : "Seleccione proveedor..."
            }
            data={proveedores.map((p) => ({
              value: String(p.id_proveedor),
              label: p.razon_social,
            }))}
            label="Proveedor"
            withAsterisk
            disabled={loadingProveedores}
            leftSection={
              <IdentificationIcon className="w-4 h-4 text-zinc-500" />
            }
            value={cot.id_proveedor === 0 ? null : String(cot.id_proveedor)}
            onChange={(val) =>
              onUpdateHeader(idx, "id_proveedor", Number(val))
            }
            searchable
            size="xs"
            radius="lg"
            classNames={inputStyles}
            className="flex-1"
            comboboxProps={{
              withinPortal: true,
              zIndex: 9999,
              transitionProps: { transition: "pop", duration: 200 },
            }}
          />

          <div
            className="bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 h-[32px] flex items-center justify-center transition-all hover:bg-zinc-900/60 hover:border-green-500/40 group/check cursor-pointer"
            onClick={() =>
              onUpdateHeader(
                idx,
                "estado",
                cot.estado === Estado_Cotizacion.Aprobada
                  ? Estado_Cotizacion.Generada
                  : Estado_Cotizacion.Aprobada,
              )
            }
          >
            <Group gap="xs" wrap="nowrap" align="center">
              <Text
                size="10px"
                fw={900}
                className="uppercase tracking-widest text-zinc-400 group-hover/check:text-green-400 transition-colors select-none"
              >
                Aprobar
              </Text>
              <Checkbox
                size="xs"
                color="green"
                checked={cot.estado === Estado_Cotizacion.Aprobada}
                onChange={() => {
                  // Ya manejado por el div padre, per evitamos propagarlo por duplicado si se da exacto en el checkbox
                }}
                styles={{
                  input: { cursor: "pointer", pointerEvents: "none" },
                }}
              />
            </Group>
          </div>
        </Group>

        <MultiSelect
          placeholder={
            loadingProveedores
              ? "Cargando..."
              : "Seleccione empresas compradoras..."
          }
          data={empresas.map((e) => ({
            value: String(e.id_empresa),
            label: e.razon_social,
          }))}
          label="Empresas Asociadas"
          withAsterisk
          disabled={loadingProveedores}
          value={cot.empresas_ids.map(String)}
          onChange={(vals) =>
            onUpdateHeader(idx, "empresas_ids", vals.map(Number))
          }
          searchable
          clearable
          size="xs"
          radius="lg"
          classNames={inputStyles}
          className="w-full"
          hidePickedOptions
          maxDropdownHeight={200}
        />

      </Stack>

      {/* Resumen de Totales y Tax (Siempre visibles) */}
      <Group justify="space-between" align="center" className="mt-2" wrap="nowrap">
        <Group grow wrap="nowrap" gap="xs" className="flex-1 overflow-hidden">
          <Stack
            gap={0}
            px="xs"
            py={4}
            className="bg-pink-700 rounded-lg shadow-sm border border-pink-500/20 min-w-0"
          >
            <Text
              size="9px"
              fw={800}
              className="text-white uppercase truncate opacity-90"
            >
              Subtotal
            </Text>
            <Text size="xs" fw={800} className="text-white truncate">
              {cot.moneda === "Soles" ? "S/. " : "$ "}
              {formatNumber(cot.total_antes_igv)}
            </Text>
          </Stack>

          <Stack
            gap={0}
            px="xs"
            py={4}
            className="bg-purple-700 rounded-lg shadow-sm border border-purple-500/20 min-w-0"
          >
            <Text
              size="9px"
              fw={800}
              className="text-white uppercase truncate opacity-90"
            >
              IGV
            </Text>
            <Text size="xs" fw={800} className="text-white truncate">
              {cot.moneda === "Soles" ? "S/. " : "$ "}
              {formatNumber(cot.monto_igv)}
            </Text>
          </Stack>

          <Stack
            gap={0}
            px="xs"
            py={4}
            className="bg-cyan-600 rounded-lg shadow-md border border-cyan-400/20 min-w-0"
          >
            <Text
              size="9px"
              fw={800}
              className="text-white uppercase truncate opacity-90"
            >
              Total
            </Text>
            <Text size="xs" fw={800} className="text-white truncate">
              {cot.moneda === "Soles" ? "S/. " : "$ "}
              {formatNumber(cot.total_despues_igv)}
            </Text>
          </Stack>
        </Group>

        {/* Botón de Configuración Adicional */}
        <Group gap="xs" className="flex-none">
          <Popover width={350} position="bottom" withArrow shadow="md">
            <Popover.Target>
              <Tooltip label="Configuración y Gastos" withArrow>
                <ActionIcon
                  variant="light"
                  color="indigo"
                  radius="md"
                  size="md"
                  className="border border-indigo-500/20"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                </ActionIcon>
              </Tooltip>
            </Popover.Target>
            <Popover.Dropdown className="bg-zinc-950 border-zinc-800 shadow-2xl">
              <Stack gap="sm">
                <Text size="sm" fw={800} className="text-white mb-2">
                  Configuración y Gastos Adicionales
                </Text>

                <Group grow gap="md">
                  <Select
                    label="Moneda"
                    data={["Soles", "Dolares"]}
                    value={cot.moneda}
                    onChange={(val) =>
                      onUpdateHeader(idx, "moneda", val ?? "Soles")
                    }
                    classNames={inputStyles}
                    size="xs"
                    radius="lg"
                    comboboxProps={{ withinPortal: false }}
                  />
                  <Select
                    label="Método de Pago"
                    data={[
                      { value: MetodoPago.Contado, label: "Contado" },
                      { value: MetodoPago.Credito, label: "Crédito" },
                    ]}
                    value={cot.metodo_pago}
                    onChange={(val) =>
                      onUpdateHeader(
                        idx,
                        "metodo_pago",
                        (val as MetodoPago) ?? MetodoPago.Contado,
                      )
                    }
                    classNames={inputStyles}
                    size="xs"
                    radius="lg"
                    comboboxProps={{ withinPortal: false }}
                  />
                </Group>

                {cot.metodo_pago === MetodoPago.Credito && (
                  <CustomDatePicker
                    label="Fecha de Vencimiento"
                    withAsterisk
                    placeholder="Seleccione fecha..."
                    value={cot.fecha_vencimiento_pago as unknown as Date | null}
                    onChange={(val) =>
                      onUpdateHeader(
                        idx,
                        "fecha_vencimiento_pago",
                        val as unknown as string,
                      )
                    }
                    size="xs"
                    radius="lg"
                  />
                )}

                <div className="border-t border-zinc-800/50 mt-1 mb-1" />

                <TextInput
                  label="Observación (Opcional)"
                  placeholder="Escriba alguna observación..."
                  leftSection={
                    <ClipboardDocumentCheckIcon className="w-4 h-4 text-zinc-500" />
                  }
                  value={cot.observacion || ""}
                  onChange={(e) =>
                    onUpdateHeader(idx, "observacion", e.currentTarget.value)
                  }
                  classNames={inputStyles}
                  size="xs"
                  radius="lg"
                />

                <Group grow gap="md">
                  <NumberInput
                    label="Flete (Opcional)"
                    placeholder="0.00"
                    leftSection={<TruckIcon className="w-4 h-4 text-zinc-500" />}
                    value={cot.costo_flete ?? 0}
                    onChange={(val) =>
                      onUpdateHeader(idx, "costo_flete", Number(val))
                    }
                    min={0}
                    decimalScale={2}
                    size="xs"
                    radius="lg"
                    classNames={inputStyles}
                  />
                  <NumberInput
                    label="Otros Gastos"
                    placeholder="0.00"
                    leftSection={
                      <CurrencyDollarIcon className="w-4 h-4 text-zinc-500" />
                    }
                    value={cot.otros_gastos ?? 0}
                    onChange={(val) =>
                      onUpdateHeader(idx, "otros_gastos", Number(val))
                    }
                    min={0}
                    decimalScale={2}
                    size="xs"
                    radius="lg"
                    classNames={inputStyles}
                  />
                </Group>

                <Group grow align="flex-start" gap="md" className="mt-2 pt-4 border-t border-zinc-800/50">
                  <Stack gap={2}>
                    <Text
                      size="xs"
                      fw={500}
                      className="text-zinc-300 mb-1.5 font-medium"
                    >
                      Incluye IGV
                    </Text>
                    <Switch
                      checked={cot.incluye_igv}
                      onChange={(e) =>
                        onUpdateHeader(idx, "incluye_igv", e.currentTarget.checked)
                      }
                      size="xs"
                      color="indigo"
                    />
                  </Stack>
                  <Stack gap={2}>
                    <Text
                      size="xs"
                      fw={500}
                      className="text-zinc-300 mb-1.5 font-medium"
                    >
                      Porcentaje IGV
                    </Text>
                    <NumberInput
                      value={cot.porcentaje_igv}
                      onChange={(val) =>
                        onUpdateHeader(idx, "porcentaje_igv", Number(val))
                      }
                      disabled
                      size="xs"
                      radius="lg"
                      classNames={inputStyles}
                      suffix="%"
                    />
                  </Stack>
                </Group>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </Group>
      </Group>

    </Stack>
  );
};
