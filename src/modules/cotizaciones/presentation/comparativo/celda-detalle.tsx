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
    prodId: number,
    field: K,
    value: DTO_CotizacionDetalle[K],
  ) => void;
  onToggleNoCotiza: (cotIndex: number, prodId: number) => void;
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
}: CeldaDetalleProps) => {
  if (isSkeleton) {
    return (
      <Stack gap="sm" className="w-full">
        <Group grow align="flex-end" gap="xs">
          <Skeleton h={32} radius="lg" animate={false} />
          <Skeleton h={32} radius="lg" animate={false} />
        </Group>
        <Group grow align="flex-end" gap="xs">
          <Skeleton h={32} radius="lg" animate={false} />
          <Skeleton h={32} radius="lg" animate={false} />
        </Group>
        <Skeleton h={32} radius="lg" animate={false} />
        <Group grow align="flex-end" gap="xs">
          <Skeleton h={32} radius="lg" animate={false} />
          <Skeleton h={32} radius="lg" animate={false} />
        </Group>
        <Skeleton h={32} radius="lg" animate={false} />
        <Group grow wrap="nowrap" gap="xs">
          <Skeleton h={40} radius="md" animate={false} />
          <Skeleton h={40} radius="md" animate={false} />
          <Skeleton h={40} radius="md" animate={false} />
        </Group>
        <Skeleton h={32} radius="lg" animate={false} />
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
              onChange={() => onToggleNoCotiza(cotIdx, prod.id_producto)}
              className="hover:scale-110 transition-transform cursor-pointer"
            />
          </Group>
        </Tooltip>
      </div>

      {/* Campos editables */}
      <Stack
        gap="sm"
        className={`w-full pt-6 transition-all duration-300 ${
          det.no_cotiza
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
                prod.id_producto,
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
              onUpdateDetail(cotIdx, prod.id_producto, "cantidad", Number(val))
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
                {baseAbrev} x {abrev} <span className="text-red-500">*</span>
              </Text>
            }
            value={det.contenido_por_presentacion}
            onChange={(val) =>
              onUpdateDetail(
                cotIdx,
                prod.id_producto,
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
                Precio x {abrev} <span className="text-red-500">*</span>
              </Text>
            }
            value={det.precio_unitario}
            onChange={(val) =>
              onUpdateDetail(
                cotIdx,
                prod.id_producto,
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

        {/* Fila 3: Almacén recepcionista */}
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
              prod.id_producto,
              "id_almacen_recepcionista",
              Number(val),
            )
          }
          size="xs"
          radius="lg"
          classNames={inputStyles}
          searchable
          comboboxProps={{ withinPortal: true, zIndex: 9999 }}
        />

        {/* Fila 4: Tipo de despacho y tiempo de entrega */}
        <Group grow align="flex-end" gap="xs">
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
                prod.id_producto,
                "tipo_despacho",
                val as TipoDespachoCompra,
              )
            }
            size="xs"
            radius="lg"
            classNames={inputStyles}
            comboboxProps={{ withinPortal: true, zIndex: 9999 }}
          />
          <Group grow gap={4} align="flex-end">
            <NumberInput
              label={
                <Group gap={4} wrap="nowrap">
                  <ClockIcon className="w-3 h-3 text-zinc-500" />
                  <Text size="xs" fw={500} className="text-zinc-300">
                    Entrega
                  </Text>
                </Group>
              }
              value={det.tiempo_entrega}
              onChange={(val) =>
                onUpdateDetail(
                  cotIdx,
                  prod.id_producto,
                  "tiempo_entrega",
                  Number(val),
                )
              }
              min={1}
              size="xs"
              radius="lg"
              classNames={inputStyles}
              className="flex-[0.4]"
            />
            <Select
              label=" "
              data={PERIODO_OPTIONS}
              value={det.tiempo_entrega_periodo}
              onChange={(val) =>
                onUpdateDetail(
                  cotIdx,
                  prod.id_producto,
                  "tiempo_entrega_periodo",
                  val as Periodo,
                )
              }
              size="xs"
              radius="lg"
              classNames={inputStyles}
              className="flex-[0.6]"
              comboboxProps={{ withinPortal: true, zIndex: 9999 }}
            />
          </Group>
        </Group>

        {/* Lugar de recojo (solo si tipo_despacho === Recojo) */}
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
                prod.id_producto,
                "lugar_recojo",
                e.currentTarget.value,
              )
            }
            size="xs"
            radius="lg"
            classNames={inputStyles}
          />
        )}

        {/* Fila 5: Tarjetas de Resultados Financieros */}
        <Group grow wrap="nowrap" gap="xs">
          <Stack
            gap={0}
            px="xs"
            py={4}
            className="bg-cyan-600 rounded-lg shadow-sm border border-cyan-400/20"
          >
            <Text
              size="9px"
              fw={800}
              className="text-white uppercase truncate opacity-90"
            >
              Total {baseAbrev}
            </Text>
            <Text size="xs" fw={800} className="text-white">
              {det.cantidad * det.contenido_por_presentacion} {baseAbrev}
            </Text>
          </Stack>

          <Stack
            gap={0}
            px="xs"
            py={4}
            className="bg-teal-600 rounded-lg shadow-sm border border-teal-400/20"
          >
            <Text
              size="9px"
              fw={800}
              className="text-white uppercase truncate opacity-90"
            >
              Precio x {baseAbrev}
            </Text>
            <Text size="xs" fw={800} className="text-white">
              {cot.moneda === "Soles" ? "S/. " : "$ "}
              {formatNumber(det.precio_unitario_base)}
            </Text>
          </Stack>

          <Stack
            gap={0}
            px="xs"
            py={4}
            className="bg-emerald-700 rounded-lg shadow-md border border-emerald-500/20"
          >
            <Text
              size="9px"
              fw={800}
              className="text-white uppercase truncate opacity-90"
            >
              Subtotal
            </Text>
            <Text size="xs" fw={800} className="text-white">
              {cot.moneda === "Soles" ? "S/. " : "$ "}
              {formatNumber(det.cantidad * det.precio_unitario)}
            </Text>
          </Stack>
        </Group>

        {/* Tiempo de entrega calculado */}
        {det.tiempo_entrega_dias > 0 && (
          <Text size="11px" className="text-zinc-500 text-center">
            ≈ {det.tiempo_entrega_dias} día
            {det.tiempo_entrega_dias !== 1 ? "s" : ""} de entrega estimados
          </Text>
        )}

        <TextInput
          label="Comentario (Opcional)"
          placeholder="Marca, color, etc..."
          size="xs"
          radius="lg"
          classNames={inputStyles}
          value={det.comentario || ""}
          onChange={(e) =>
            onUpdateDetail(
              cotIdx,
              prod.id_producto,
              "comentario",
              e.currentTarget.value,
            )
          }
          leftSection={
            <ChatBubbleBottomCenterTextIcon className="w-3 h-3 text-zinc-600" />
          }
        />
      </Stack>
    </>
  );
};
