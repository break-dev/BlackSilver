import { Group, Stack, Text, Badge, Tooltip } from "@mantine/core";
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
      <div className="flex items-center justify-center p-4 bg-zinc-950/20 rounded-2xl border border-zinc-800/40">
        <Badge variant="light" color="red" size="sm" className="font-bold opacity-60">
          No Cotiza
        </Badge>
      </div>
    );
  }

  const totalBase = cantidad * (contenidoPorPresentacion || 1);
  const precioBase = precioUnitario / (contenidoPorPresentacion || 1);
  const subtotal = cantidad * precioUnitario;

  return (
    <Stack gap="xs" className="w-full">
      <div className="bg-zinc-950/40 rounded-2xl p-3 border border-zinc-800/50 shadow-inner group/item relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-br from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none" />
        <Group justify="space-between" wrap="nowrap" align="flex-end">
          <Stack gap={0}>
            <Text size="10px" c="dimmed" fw={700} className="uppercase tracking-tighter opacity-70">Solicitado</Text>
            <Text size="sm" fw={800} className="text-white">
              {formatNumber(cantidad)} <span className="text-[10px] text-zinc-500 font-bold uppercase">{unidadMedida}</span>
            </Text>
          </Stack>
          <Stack gap={0} align="flex-end">
            <Text size="10px" c="emerald.5" fw={800} className="uppercase tracking-tighter">Unitario</Text>
            <Text size="sm" fw={900} className="text-emerald-400 font-mono">
              {smb} {formatNumber(precioUnitario)}
            </Text>
          </Stack>
        </Group>
      </div>

      <Group grow wrap="nowrap" gap={6}>
        <Stack gap={0} px="xs" py={4} className="bg-cyan-500/10 rounded-xl border border-cyan-500/20">
          <Text size="9px" fw={800} className="text-cyan-400 uppercase truncate">Factor Base</Text>
          <Text size="xs" fw={800} className="text-cyan-100">{formatNumber(totalBase)} {unidadMedidaBase}</Text>
        </Stack>
        <Stack gap={0} px="xs" py={4} className="bg-teal-500/10 rounded-xl border border-teal-500/20">
          <Text size="9px" fw={800} className="text-teal-400 uppercase truncate">Precio/Base</Text>
          <Text size="xs" fw={800} className="text-teal-100">{smb} {formatNumber(precioBase)}</Text>
        </Stack>
      </Group>

      <div className="flex items-center justify-between px-1">
        {comentario ? (
          <Tooltip label={comentario} position="top" withArrow>
            <div className="flex items-center gap-1.5 cursor-help">
              <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-indigo-400" />
              <Text size="xs" c="dimmed" fs="italic">Ver obs.</Text>
            </div>
          </Tooltip>
        ) : <div />}
        <Stack gap={0} align="flex-end">
          <Text size="9px" fw={800} className="text-emerald-500 uppercase">Subtotal</Text>
          <Text size="sm" fw={900} className="text-white font-mono">{smb} {formatNumber(subtotal)}</Text>
        </Stack>
      </div>
    </Stack>
  );
};
