import { Group, Stack, Text, Badge, Divider } from "@mantine/core";
import { formatNumber } from "../../../../presentation/functions/formatNumber";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";

interface CeldaDetalleItemProps {
  cantidad: number;
  precioUnitario: number;
  moneda: string;
  unidadMedida: string;
  contenidoPorPresentacion: number;
  unidadMedidaBase: string;
  comentario?: string | null;
  noCotiza?: boolean;
}

export const CeldaDetalleItem = ({
  cantidad,
  precioUnitario,
  moneda,
  unidadMedida,
  contenidoPorPresentacion,
  unidadMedidaBase,
  comentario,
  noCotiza = false,
}: CeldaDetalleItemProps) => {
  const smb = moneda === "Soles" ? "S/." : "$";

  if (noCotiza) {
    return (
      <div className="flex items-center justify-center p-4 bg-zinc-950/20 rounded-2xl border border-dashed border-red-900/40 min-h-[160px]">
        <Badge
          variant="dot"
          color="red"
          size="sm"
          className="font-bold opacity-60"
        >
          No Cotiza
        </Badge>
      </div>
    );
  }

  const subtotal = cantidad * precioUnitario;
  const showConversion =
    (unidadMedida !== unidadMedidaBase && unidadMedidaBase) ||
    Number(contenidoPorPresentacion) > 1;

  return (
    <Stack gap={6} className="w-full h-full min-h-[160px] justify-between p-1">
      {/* Contenedor Principal Morado (Estilo Mini-Recibo) */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-3 shadow-inner flex-1 flex flex-col justify-between">
        <Stack gap={5}>
          <Group justify="space-between" wrap="nowrap">
            <Text
              size="10px"
              fw={800}
              className="text-zinc-500 uppercase tracking-tighter"
            >
              Precio x {unidadMedida}
            </Text>
            <Text size="xs" fw={800} className="text-zinc-200">
              {smb} {formatNumber(precioUnitario)}
            </Text>
          </Group>

          <Group justify="space-between" wrap="nowrap">
            <Text
              size="10px"
              fw={800}
              className="text-zinc-500 uppercase tracking-tighter"
            >
              Total {unidadMedida}
            </Text>
            <Text size="xs" fw={800} className="text-zinc-200">
              {formatNumber(cantidad)}
            </Text>
          </Group>

          {showConversion && (
            <Text
              size="9px"
              c="dimmed"
              fw={700}
              className="italic opacity-70 mt-0.5 leading-none"
            >
              * 1 {unidadMedida} = {formatNumber(contenidoPorPresentacion)}{" "}
              {unidadMedidaBase}
            </Text>
          )}
        </Stack>

        <Stack gap={4} mt={10}>
          <Divider color="indigo.9" variant="dashed" opacity={0.3} />
          <Group justify="space-between" wrap="nowrap" align="flex-end">
            <Text size="10px" fw={900} className="text-indigo-400 uppercase">
              Subtotal
            </Text>
            <Text size="sm" fw={950} className="text-indigo-100 font-mono">
              {smb} {formatNumber(subtotal)}
            </Text>
          </Group>
        </Stack>
      </div>

      {/* Comentario Directo */}
      {comentario && (
        <Stack gap={2} px={4} className="mt-1">
          <Group gap={4}>
            <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-indigo-400 shrink-0" />
            <Text size="10px" fw={900} className="text-zinc-500 uppercase">
              Comentario
            </Text>
          </Group>
          <Text size="xs" c="dimmed" className="leading-tight pl-6">
            {comentario}
          </Text>
        </Stack>
      )}
    </Stack>
  );
};
