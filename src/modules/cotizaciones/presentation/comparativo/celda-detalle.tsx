import {
  Group,
  Stack,
  Text,
  NumberInput,
  Select,
  Switch,
  Tooltip,
  TextInput,
  Skeleton,
  Popover,
  ActionIcon,
  Indicator,
} from "@mantine/core";

import {
  ChatBubbleBottomCenterTextIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { formatNumber } from "../../../../shared/functions/formatNumber";
import type {
  DTO_CotizacionRequest,
  DTO_CotizacionDetalle,
  DTO_ProductoComparativo,
} from "../../service/cotizaciones.requests";
import { TipoDespachoCompra } from "../../../../shared/enums/_generic/tipo-despacho-compra";
import { Periodo } from "../../../../shared/enums/_generic/periodo";
import type { RES_Almacen } from "../../../../service/responses/almacen";

interface CeldaDetalleProps {
  det?: DTO_CotizacionDetalle;
  prod?: DTO_ProductoComparativo & {
    nombre: string;
    codigo: string;
    id_unidad_medida_base: number;
    unidad_medida_base: string;
    unidad_medida_abreviatura: string;
  };
  cot?: DTO_CotizacionRequest;
  cotIdx: number;
  unidadesMedida: { value: string; label: string; abreviatura: string }[];
  almacenes: RES_Almacen[];
  onUpdateDetail: <K extends keyof DTO_CotizacionDetalle>(
    cotIndex: number,
    rowIndex: number,
    field: K,
    value: DTO_CotizacionDetalle[K],
  ) => void;
  onToggleNoCotiza: (cotIndex: number, rowIndex: number) => void;
  isSkeleton?: boolean;
}

const inputStyles = {
  input:
    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-600 !font-normal transition-all",
  label: "text-zinc-300 mb-1.5 font-medium text-xs",
  description: "text-zinc-500 text-[10px] italic mt-1 leading-tight",
};

const PERIODO_OPTIONS = [
  { value: Periodo.Diario, label: "Día(s)" },
  { value: Periodo.Semanal, label: "Semana(s)" },
  { value: Periodo.Mensual, label: "Mes(es)" },
  { value: Periodo.Anual, label: "Año(s)" },
];

export const CeldaDetalle = ({
  det,
  prod,
  cot,
  cotIdx,
  unidadesMedida,
  almacenes,
  onUpdateDetail,
  onToggleNoCotiza,
  isSkeleton = false,
  rowIndex,
}: CeldaDetalleProps & { rowIndex: number }) => {
  if (isSkeleton) {
    return (
      <Stack gap={8} className="w-full pt-4">
        <Group grow align="flex-end" gap="xs">
          <Skeleton h={50} radius="lg" animate={false} className="opacity-20" />
          <Skeleton h={50} radius="lg" animate={false} className="opacity-20" />
        </Group>
        <Group grow align="flex-end" gap="xs">
          <Skeleton h={50} radius="lg" animate={false} className="opacity-20" />
          <Skeleton h={50} radius="lg" animate={false} className="opacity-20" />
        </Group>
        <Group grow wrap="nowrap" gap="xs" className="mt-0">
          <Skeleton h={40} radius="md" animate={false} className="opacity-20" />
          <Skeleton h={40} radius="md" animate={false} className="opacity-20" />
          <Skeleton h={40} radius="md" animate={false} className="opacity-20" />
        </Group>
      </Stack>
    );
  }

  if (!det || !prod || !cot) return null;

  const currentUnit = unidadesMedida.find(
    (u) => u.value === String(det.id_unidad_medida),
  );
  const abrev = currentUnit?.abreviatura || "---";
  const baseAbrev = prod.unidad_medida_abreviatura || "UND";
  const esRecojo = det.tipo_despacho === TipoDespachoCompra.Recojo;

  return (
    <>
      {/* Switch de Inhabilitación */}
      <div className="absolute top-2 right-2 z-10">
        <Tooltip
          label={
            det.no_cotiza
              ? "Habilitar para cotizar"
              : "Marcar como: No cotiza este producto"
          }
          position="left"
        >
          <Group gap={6} align="center">
            <Switch
              size="xs"
              color="red"
              checked={!det.no_cotiza}
              onChange={() => onToggleNoCotiza(cotIdx, rowIndex)}
              className="hover:scale-110 transition-transform cursor-pointer"
            />
          </Group>
        </Tooltip>
      </div>

      {/* Campos editables */}
      <Stack
        gap="sm"
        className={`w-full pt-6 transition-all duration-300 ${det.no_cotiza
          ? "opacity-20 pointer-events-none grayscale blur-[0.5px]"
          : ""
          }`}
      >
        {/* Fila 1: Unidad y Cantidad */}
        <Group grow align="flex-end" gap="xs">
          <Select
            label="Und. de Medida"
            data={unidadesMedida}
            value={String(det.id_unidad_medida)}
            onChange={(val) =>
              onUpdateDetail(
                cotIdx,
                rowIndex,
                "id_unidad_medida",
                Number(val),
              )
            }
            size="xs"
            radius="lg"
            classNames={inputStyles}
            withAsterisk
            comboboxProps={{ withinPortal: true, zIndex: 9999 }}
          />
          <NumberInput
            label={`Cantidad de ${abrev}`}
            value={det.cantidad}
            onChange={(val) =>
              onUpdateDetail(cotIdx, rowIndex, "cantidad", Number(val))
            }
            min={0}
            size="xs"
            radius="lg"
            withAsterisk
            classNames={inputStyles}
          />
        </Group>

        {/* Fila 2: Factor y Precio */}
        <Group grow align="flex-end" gap="xs">
          <NumberInput
            label={
              <Text size="xs" fw={500} className="text-zinc-300">
                {baseAbrev} x {abrev}
              </Text>
            }
            value={det.contenido_por_presentacion}
            onChange={(val) =>
              onUpdateDetail(
                cotIdx,
                rowIndex,
                "contenido_por_presentacion",
                Number(val),
              )
            }
            disabled={det.id_unidad_medida === prod.id_unidad_medida_base}
            min={1}
            size="xs"
            radius="lg"
            classNames={inputStyles}
          />
          <NumberInput
            label={
              <Text size="xs" fw={500} className="text-zinc-300">
                Precio x {abrev}
              </Text>
            }
            value={det.precio_unitario}
            onChange={(val) =>
              onUpdateDetail(
                cotIdx,
                rowIndex,
                "precio_unitario",
                Number(val),
              )
            }
            min={0}
            size="xs"
            radius="lg"
            classNames={inputStyles}
            placeholder="0.00"
            decimalScale={2}
          />
        </Group>

        {/* Totales y Botones de Popover */}
        <Group justify="space-between" align="center" className="mt-1" wrap="nowrap">
          {/* Tarjetas de Resultados Financieros */}
          <Group grow wrap="nowrap" gap="xs" className="flex-1 overflow-hidden">
            <Stack
              gap={0}
              px="xs"
              py={4}
              className="bg-cyan-600 rounded-lg shadow-sm border border-cyan-400/20 min-w-0"
            >
              <Text
                size="9px"
                fw={800}
                className="text-white uppercase truncate opacity-90"
              >
                Total {baseAbrev}
              </Text>
              <Text size="xs" fw={800} className="text-white truncate">
                {det.cantidad * det.contenido_por_presentacion} {baseAbrev}
              </Text>
            </Stack>

            <Stack
              gap={0}
              px="xs"
              py={4}
              className="bg-teal-600 rounded-lg shadow-sm border border-teal-400/20 min-w-0"
            >
              <Text
                size="9px"
                fw={800}
                className="text-white uppercase truncate opacity-90"
              >
                Precio x {baseAbrev}
              </Text>
              <Text size="xs" fw={800} className="text-white truncate">
                {cot.moneda === "Soles" ? "S/. " : "$ "}
                {formatNumber(det.precio_unitario_base)}
              </Text>
            </Stack>

            <Stack
              gap={0}
              px="xs"
              py={4}
              className="bg-emerald-700 rounded-lg shadow-md border border-emerald-500/20 min-w-0"
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
                {formatNumber(det.cantidad * det.precio_unitario)}
              </Text>
            </Stack>
          </Group>

          <Group gap="xs" className="flex-none">
            {/* Popover de Logística */}
            <Popover width={320} position="bottom" withArrow shadow="md">
              <Popover.Target>
                <Tooltip label="Configurar (Almacén, Despacho, Entrega)" withArrow>
                  <Indicator color="red" size={8} offset={2} zIndex={10} disabled={!esRecojo && det.tiempo_entrega === 0}>
                    <ActionIcon
                      variant="light"
                      color="cyan"
                      radius="md"
                      size="md"
                      className="border border-cyan-500/20"
                    >
                      <TruckIcon className="w-4 h-4" />
                    </ActionIcon>
                  </Indicator>
                </Tooltip>
              </Popover.Target>
              <Popover.Dropdown className="bg-zinc-950 border-zinc-800 shadow-2xl p-4">
                <Stack gap="sm">
                  <Text size="sm" fw={800} className="text-white mb-1">
                    Despacho
                  </Text>
                  <Select
                    label="Almacén de Recepción"
                    placeholder="Seleccione almacén..."
                    withAsterisk
                    leftSection={
                      <BuildingStorefrontIcon className="w-4 h-4 text-zinc-500" />
                    }
                    data={almacenes.map((a) => ({
                      value: String(a.id_almacen),
                      label: a.es_principal ? `${a.nombre} ★` : a.nombre,
                    }))}
                    value={
                      det.id_almacen_recepcionista === 0
                        ? null
                        : String(det.id_almacen_recepcionista)
                    }
                    onChange={(val) =>
                      onUpdateDetail(
                        cotIdx,
                        rowIndex,
                        "id_almacen_recepcionista",
                        Number(val),
                      )
                    }
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
                    value={det.tipo_despacho}
                    onChange={(val) =>
                      onUpdateDetail(
                        cotIdx,
                        rowIndex,
                        "tipo_despacho",
                        val as TipoDespachoCompra,
                      )
                    }
                    size="xs"
                    radius="lg"
                    classNames={inputStyles}
                    comboboxProps={{ withinPortal: false }}
                  />
                  <div>
                    <Group gap={4} wrap="nowrap" mb={6}>
                      <ClockIcon className="w-3.5 h-3.5 text-zinc-400" />
                      <Text size="xs" fw={700} className="text-zinc-300 uppercase tracking-wider">
                        Entrega
                      </Text>
                    </Group>
                    <Group grow gap="xs">
                      <NumberInput
                        value={det.tiempo_entrega}
                        onChange={(val) =>
                          onUpdateDetail(
                            cotIdx,
                            rowIndex,
                            "tiempo_entrega",
                            Number(val),
                          )
                        }
                        min={1}
                        size="xs"
                        radius="lg"
                        classNames={inputStyles}
                      />
                      <Select
                        data={PERIODO_OPTIONS}
                        value={det.tiempo_entrega_periodo}
                        onChange={(val) =>
                          onUpdateDetail(
                            cotIdx,
                            rowIndex,
                            "tiempo_entrega_periodo",
                            val as Periodo,
                          )
                        }
                        size="xs"
                        radius="lg"
                        classNames={inputStyles}
                        comboboxProps={{ withinPortal: false }}
                      />
                    </Group>
                  </div>

                  {esRecojo && (
                    <TextInput
                      label="Lugar de Recojo"
                      placeholder="Dirección, local, etc..."
                      withAsterisk
                      leftSection={<MapPinIcon className="w-4 h-4 text-zinc-500" />}
                      value={det.lugar_recojo || ""}
                      onChange={(e) =>
                        onUpdateDetail(
                          cotIdx,
                          rowIndex,
                          "lugar_recojo",
                          e.currentTarget.value,
                        )
                      }
                      size="xs"
                      radius="lg"
                      classNames={inputStyles}
                    />
                  )}

                  {det.tiempo_entrega_dias > 0 && (
                    <Text size="11px" className="text-zinc-500 text-center mt-2">
                      ≈ {det.tiempo_entrega_dias} día
                      {det.tiempo_entrega_dias !== 1 ? "s" : ""} de entrega estimados
                    </Text>
                  )}
                </Stack>
              </Popover.Dropdown>
            </Popover>

            {/* Popover de Comentario */}
            <Popover width={300} position="bottom" withArrow shadow="md">
              <Popover.Target>
                <Tooltip label="Comentario (Opcional)" withArrow>
                  <Indicator color="yellow" size={8} offset={2} zIndex={10} disabled={!det.comentario}>
                    <ActionIcon
                      variant="light"
                      color="gray"
                      radius="md"
                      size="md"
                      className="border border-zinc-500/20"
                    >
                      <ChatBubbleBottomCenterTextIcon className={`w-4 h-4 ${det.comentario ? "text-yellow-500" : "text-zinc-400"}`} />
                    </ActionIcon>
                  </Indicator>
                </Tooltip>
              </Popover.Target>
              <Popover.Dropdown className="bg-zinc-950 border-zinc-800 shadow-2xl p-4">
                <TextInput
                  label="Comentario del Producto"
                  placeholder="Marca, color, especificaciones..."
                  size="xs"
                  radius="lg"
                  classNames={inputStyles}
                  value={det.comentario || ""}
                  onChange={(e) =>
                    onUpdateDetail(
                      cotIdx,
                      rowIndex,
                      "comentario",
                      e.currentTarget.value,
                    )
                  }
                  leftSection={
                    <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-zinc-500" />
                  }
                />
              </Popover.Dropdown>
            </Popover>
          </Group>
        </Group>
      </Stack>
    </>
  );
};
