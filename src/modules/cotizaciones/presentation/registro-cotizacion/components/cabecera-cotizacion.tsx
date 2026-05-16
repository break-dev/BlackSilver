import { useState } from "react";
import {
  Group,
  Stack,
  Text,
  NumberInput,
  Select,
  MultiSelect,
  ActionIcon,
  TextInput,
  Checkbox,
  Skeleton,
  Popover,
  Tooltip,
  Button,
  Badge,
  SegmentedControl,
} from "@mantine/core";
import {
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  IdentificationIcon,
  TruckIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  BuildingStorefrontIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { CustomDatePicker } from "../../../../../presentation/utils/date-picker-input";
import { formatNumber } from "../../../../../shared/functions/formatNumber";
import type { DTO_CotizacionRequest } from "../../../service/cotizaciones.requests";
import { MetodoPago } from "../../../../../shared/enums/_generic/metodo-pago";
import { Estado_Cotizacion } from "../../../../../shared/enums/cotizacion/cotizacion";
import type { RES_Almacen } from "../../../../../service/responses/almacen";
import { TipoDespachoCompra } from "../../../../../shared/enums/_generic/tipo-despacho-compra";
import { Periodo } from "../../../../../shared/enums/_generic/periodo";
import { useNotify } from "../../../../../hooks/useNotify";
import { MONEDAS } from "../../../../../shared/variables/monedas";
import { getDuracionPeriodo } from "../../../../../shared/functions/get-duracion-periodo";
import { enPlural } from "../../../../../shared/functions/en-plural";
import type { RES_Proveedor } from "../../../../../service/responses/proveedor";

interface CabeceraCotizacionProps {
  cot?: DTO_CotizacionRequest;
  idx: number;

  proveedores: RES_Proveedor[];
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
  almacenes?: RES_Almacen[];
  onUpdateGlobalLogistica?: (
    cotIndex: number,
    data: {
      id_almacen_recepcionista: number;
      tipo_despacho: TipoDespachoCompra;
      lugar_recojo?: string;
      tiempo_entrega: number;
      tiempo_entrega_periodo: Periodo;
    },
  ) => void;
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
  almacenes = [],
  onUpdateGlobalLogistica,
}: CabeceraCotizacionProps) => {
  const PERIODO_OPTIONS = [
    { value: Periodo.Diario, label: "Día(s)" },
    { value: Periodo.Semanal, label: "Semana(s)" },
    { value: Periodo.Mensual, label: "Mes(es)" },
    { value: Periodo.Anual, label: "Año(s)" },
  ];

  const { notify } = useNotify();
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [globalAlmacen, setGlobalAlmacen] = useState<string | null>(null);
  const [globalLugarRecojo, setGlobalLugarRecojo] = useState<string>("");
  const [globalDespacho, setGlobalDespacho] = useState<TipoDespachoCompra>(
    TipoDespachoCompra.Envio,
  );

  const [globalTiempo, setGlobalTiempo] = useState<number>(1);
  const [globalPeriodo, setGlobalPeriodo] = useState<Periodo>(Periodo.Semanal);

  const handleApplyGlobalLogistica = () => {
    if (!globalAlmacen || !onUpdateGlobalLogistica) return;
    onUpdateGlobalLogistica(idx, {
      id_almacen_recepcionista: Number(globalAlmacen),
      tipo_despacho: globalDespacho,
      lugar_recojo:
        globalDespacho === TipoDespachoCompra.Recojo
          ? globalLugarRecojo
          : undefined,
      tiempo_entrega: globalTiempo,
      tiempo_entrega_periodo: globalPeriodo,
    });
    setPopoverOpened(false);
    notify({
      type: "success",
      content: `Configuración aplicada a todos los productos en Cotización #${idx + 1}`,
    });
  };

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
    <Stack gap={4} className="pt-0 pb-3 px-1 relative group-header">
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
            onChange={(val) => {
              const newProvId = Number(val);
              onUpdateHeader(idx, "id_proveedor", newProvId);
              if (globalDespacho === TipoDespachoCompra.Recojo) {
                const proveedor = proveedores.find(
                  (p) => p.id_proveedor === newProvId,
                );
                setGlobalLugarRecojo(proveedor?.direccion || "");
              }
            }}
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
      <Group
        justify="space-between"
        align="center"
        className="mt-2"
        wrap="nowrap"
      >
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
              {cot.moneda === MONEDAS.PEN.label ? "S/. " : "$ "}
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
              {cot.moneda === MONEDAS.PEN.label ? "S/. " : "$ "}
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
              {cot.moneda === MONEDAS.PEN.label ? "S/. " : "$ "}
              {formatNumber(cot.total_despues_igv)}
            </Text>
          </Stack>
        </Group>

        {/* Botón de Configuración Adicional */}
        <Group gap="xs" className="flex-none">
          <Popover
            width={320}
            position="bottom"
            withArrow
            shadow="md"
            opened={popoverOpened}
            onChange={setPopoverOpened}
          >
            <Popover.Target>
              <Tooltip label="Configuración Global (afecta a todos)" withArrow>
                <ActionIcon
                  variant="light"
                  color="cyan"
                  radius="md"
                  size="md"
                  className="border border-cyan-500/20"
                  onClick={() => setPopoverOpened((o) => !o)}
                >
                  <TruckIcon className="w-4 h-4" />
                </ActionIcon>
              </Tooltip>
            </Popover.Target>
            <Popover.Dropdown className="bg-zinc-950 border-zinc-800 shadow-2xl p-4">
              <Stack gap="sm">
                <Text
                  size="sm"
                  fw={800}
                  className="text-white mb-1 tracking-wider"
                >
                  Cambios Globales
                </Text>
                <Select
                  label="Almacén de Recepción"
                  placeholder={
                    loadingProveedores
                      ? "Cargando almacenes..."
                      : "Seleccione almacén..."
                  }
                  disabled={loadingProveedores}
                  withAsterisk
                  leftSection={
                    <BuildingStorefrontIcon className="w-4 h-4 text-zinc-500" />
                  }
                  data={almacenes.map((a) => ({
                    value: String(a.id_almacen),
                    label: a.es_principal ? `${a.nombre} ★` : a.nombre,
                  }))}
                  value={globalAlmacen}
                  onChange={setGlobalAlmacen}
                  size="xs"
                  radius="lg"
                  classNames={inputStyles}
                  searchable
                  comboboxProps={{ withinPortal: false }}
                />

                <Select
                  label="Tipo de Despacho"
                  withAsterisk
                  leftSection={<TruckIcon className="w-4 h-4 text-zinc-500" />}
                  data={[
                    { value: TipoDespachoCompra.Envio, label: "Envío" },
                    { value: TipoDespachoCompra.Recojo, label: "Recojo" },
                  ]}
                  value={globalDespacho}
                  onChange={(val) => {
                    const newDespacho = val as TipoDespachoCompra;
                    setGlobalDespacho(newDespacho);
                    if (newDespacho === TipoDespachoCompra.Recojo && cot?.id_proveedor) {
                      const proveedor = proveedores.find((p) => p.id_proveedor === cot.id_proveedor);
                      setGlobalLugarRecojo(proveedor?.direccion || "");
                    }
                  }}
                  size="xs"
                  radius="lg"
                  classNames={inputStyles}
                  comboboxProps={{ withinPortal: false }}
                />

                {globalDespacho === TipoDespachoCompra.Recojo && (
                  <TextInput
                    label="Lugar de Recojo"
                    withAsterisk
                    placeholder="Indique dirección o local..."
                    value={globalLugarRecojo}
                    onChange={(e) =>
                      setGlobalLugarRecojo(e.currentTarget.value)
                    }
                    size="xs"
                    radius="lg"
                    classNames={inputStyles}
                  />
                )}

                <div>
                  <Group gap={4} wrap="nowrap" mb={6}>
                    <ClockIcon className="w-3.5 h-3.5 text-zinc-400" />
                    <Text
                      size="xs"
                      fw={700}
                      className="text-zinc-300 tracking-wider"
                    >
                      Entrega
                    </Text>
                  </Group>
                  <Group grow gap="xs">
                    <NumberInput
                      value={globalTiempo}
                      onChange={(val) => setGlobalTiempo(Number(val))}
                      min={1}
                      size="xs"
                      radius="lg"
                      classNames={inputStyles}
                    />
                    <Select
                      data={PERIODO_OPTIONS}
                      value={globalPeriodo}
                      onChange={(val) => setGlobalPeriodo(val as Periodo)}
                      size="xs"
                      radius="lg"
                      classNames={inputStyles}
                      comboboxProps={{ withinPortal: false }}
                    />
                  </Group>
                  <div className="mt-2 flex justify-center">
                    <Badge
                      variant="light"
                      color="cyan"
                      size="xs"
                      radius="sm"
                      className="font-bold border border-cyan-500/20"
                    >
                      ≈ {getDuracionPeriodo(globalTiempo, globalPeriodo)}{" "}
                      {enPlural(
                        "día",
                        getDuracionPeriodo(globalTiempo, globalPeriodo),
                      )}
                    </Badge>
                  </div>
                </div>

                <Button
                  fullWidth
                  mt="sm"
                  variant="gradient"
                  gradient={{ from: "cyan.6", to: "cyan.8" }}
                  onClick={handleApplyGlobalLogistica}
                  disabled={!globalAlmacen}
                  radius="xl"
                  size="xs"
                  className="font-bold shadow-lg shadow-cyan-900/20"
                >
                  Aplicar Cambios
                </Button>
              </Stack>
            </Popover.Dropdown>
          </Popover>

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
                    data={Object.values(MONEDAS).map((m) => m.label)}
                    value={cot.moneda}
                    onChange={(val) => {
                      onUpdateHeader(idx, "moneda", val ?? MONEDAS.PEN.label);
                      if (val === MONEDAS.PEN.label) {
                        onUpdateHeader(idx, "tipo_cambio_venta_referencial", 1);
                      } else {
                        onUpdateHeader(
                          idx,
                          "tipo_cambio_venta_referencial",
                          undefined,
                        );
                      }
                    }}
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

                <Group grow align="flex-end" gap="md">
                  <NumberInput
                    label="TC Venta (Ref.)"
                    placeholder="Ej. 3.85"
                    value={
                      cot.moneda === MONEDAS.PEN.label
                        ? 1
                        : (cot.tipo_cambio_venta_referencial ?? "")
                    }
                    onChange={(val) =>
                      onUpdateHeader(
                        idx,
                        "tipo_cambio_venta_referencial",
                        val === "" ? undefined : Number(val),
                      )
                    }
                    disabled={cot.moneda === MONEDAS.PEN.label}
                    min={0}
                    decimalScale={4}
                    size="xs"
                    radius="lg"
                    classNames={inputStyles}
                  />
                  <Stack gap={3}>
                    <Text size="xs" fw={500} className="font-medium">
                      Incluye IGV
                    </Text>
                    <SegmentedControl
                      size="xs"
                      radius="xl"
                      data={[
                        { label: "SÍ", value: "true" },
                        { label: "NO", value: "false" },
                      ]}
                      value={String(cot.incluye_igv)}
                      onChange={(val) =>
                        onUpdateHeader(idx, "incluye_igv", val === "true")
                      }
                      color="teal"
                      classNames={{
                        root: "bg-zinc-900 border border-zinc-800",
                      }}
                    />
                  </Stack>

                  <Stack gap={2}>
                    <NumberInput
                      label="% IGV"
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

                <Group grow gap="md">
                  <NumberInput
                    label="Flete (opc.)"
                    placeholder="0.00"
                    leftSection={
                      <TruckIcon className="w-4 h-4 text-zinc-500" />
                    }
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

                <TextInput
                  label="Observación (opc.)"
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
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </Group>
      </Group>
    </Stack>
  );
};
