import { ActionIcon, Badge, Checkbox, Group, Stack, Text } from "@mantine/core";
import { ClockIcon, CubeIcon } from "@heroicons/react/24/outline";
import { formatNumber } from "../../../../../shared/functions/formatNumber";
import { getNombrePeriodo } from "../../../../../shared/functions/get-nombre-periodo.ts";
import { Estado_OrdenCompraDetalle } from "../../../../../shared/enums/orden-compra/orden-compra.ts";
import type { RES_OrdenCompraDetalle } from "../../../../../service/responses/ordenes-compra/orden-compra";

interface OrdenCompraFilaDetalleProps {
  det: RES_OrdenCompraDetalle;
  idx: number;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onOpenTrace: (idDetalle: number, nombre: string) => void;
  symbol: string;
}

export const OrdenCompraFilaDetalle = ({
  det,
  idx,
  isSelected,
  onSelect,
  onOpenTrace,
  symbol,
}: OrdenCompraFilaDetalleProps) => {
  const req = Number(det.cantidad_requerida_base) || 0;
  const rec = Number(det.cantidad_recepcionada_base) || 0;
  const isAvailable = rec < req - 0.001;

  return (
    <tr
      className={`hover:bg-zinc-900/40 transition-colors group ${isSelected ? "bg-indigo-500/5" : ""}`}
    >
      <td className="px-6 py-4 text-center text-xs font-mono text-zinc-500">
        {idx + 1}
      </td>
      <td className="px-6 py-4 text-center">
        <Checkbox
          checked={isSelected}
          onChange={() => onSelect(det.id_orden_compra_detalle)}
          disabled={!isAvailable}
          color="indigo"
          size="sm"
          className={isAvailable ? "cursor-pointer" : "opacity-40"}
        />
      </td>
      <td className="px-6 py-4">
        <Stack gap={4}>
          <Group gap="sm">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-indigo-500/50 transition-all">
              <CubeIcon className="w-4 h-4 text-zinc-400" />
            </div>
            <Text size="sm" fw={800} className="text-zinc-100 tracking-tight">
              {det.producto}
            </Text>
          </Group>
          <Group gap={4}>
            {det.es_auditable && (
              <Badge
                variant="filled"
                color="red"
                size="9px"
                radius="xs"
                className="font-black py-1.5!"
              >
                AUDITABLE
              </Badge>
            )}
            {det.es_perecible && (
              <Badge
                variant="filled"
                color="orange"
                size="9px"
                radius="xs"
                className="font-black py-1.5!"
              >
                PERECIBLE
              </Badge>
            )}
          </Group>
        </Stack>
      </td>
      <td className="px-6 py-4 text-center">
        <Stack gap={1} align="center">
          <Text size="xs" fw={800} className="text-zinc-100">
            {formatNumber(det.cantidad_requerida)} {det.unidad_medida_oc_abv}
          </Text>
          {det.id_unidad_medida_base !== det.id_unidad_medida_oc && (
            <Badge size="xs" color="cyan" fw={700} variant="outline">
              {formatNumber(det.contenido_por_presentacion)}{" "}
              {det.unidad_medida_base_abv} x {det.unidad_medida_oc_abv}
            </Badge>
          )}
        </Stack>
      </td>
      <td className="px-6 py-4 text-center">
        <Stack gap={0} align="center">
          <Badge
            size="sm"
            fw={700}
            variant="light"
            color="lime.4"
            className="italic line-clamp-1"
          >
            {det.almacen_recepcionista}
          </Badge>
          <Group gap={4} mt={4} justify="center">
            <Badge
              color="blue"
              variant="light"
              size="xs"
              radius="xs"
              className="px-1!"
            >
              {det.tipo_despacho}
            </Badge>
            <Text size="xs" c="zinc.5" fw={600}>
              {det.tiempo_entrega}{" "}
              {getNombrePeriodo(det.tiempo_entrega_periodo)}
            </Text>
          </Group>
          {det.lugar_recojo && (
            <Text
              size="xs"
              c="zinc.5"
              mt={2}
              className="line-clamp-1"
              title={det.lugar_recojo}
            >
              Recojo: {det.lugar_recojo}
            </Text>
          )}
        </Stack>
      </td>
      <td className="px-6 py-4 text-center">
        <Text size="sm" fw={800} className="text-zinc-100 font-mono">
          {symbol} {formatNumber(det.precio_unitario)}
        </Text>
      </td>
      <td className="px-6 py-4 text-center">
        <Text size="sm" fw={900} className="text-zinc-100 font-mono">
          {symbol} {formatNumber(det.precio_unitario * det.cantidad_requerida)}
        </Text>
      </td>
      <td className="px-6 py-4 text-center">
        <Badge
          variant="light"
          color={
            det.estado === Estado_OrdenCompraDetalle.RecepcionCompleta
              ? "teal"
              : det.estado === Estado_OrdenCompraDetalle.EnRecepcion
                ? "indigo"
                : "cyan.4"
          }
          size="sm"
          radius="sm"
          className="font-bold"
        >
          {det.estado}
        </Badge>
      </td>
      <td className="px-6 py-4 text-center">
        <ActionIcon
          variant="subtle"
          color="indigo"
          radius="md"
          className="opacity-60 hover:opacity-100 hover:bg-indigo-500/10"
          onClick={() => onOpenTrace(det.id_orden_compra_detalle, det.producto)}
          title="Ver trazabilidad"
        >
          <ClockIcon className="w-5 h-5" />
        </ActionIcon>
      </td>
    </tr>
  );
};
