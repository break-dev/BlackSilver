import { Group, Stack, Text, Badge, Paper, Divider } from "@mantine/core";
import { formatNumber } from "../../../../presentation/functions/formatNumber";
import { 
  BuildingStorefrontIcon, 
  CalendarDaysIcon, 
  TagIcon,
  ChatBubbleBottomCenterTextIcon
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";

interface CabeceraDetalleCotizacionProps {
  proveedor: string;
  nroCotizacion: string;
  moneda: string;
  metodoPago: string;
  vencimiento?: string | null;
  incluyeIgv: boolean;
  montoIgv: number;
  totalAntesIgv: number;
  totalDespuesIgv: number;
  observacion?: string | null;
  isCollapsed: boolean;
}

export const CabeceraDetalleCotizacion = ({
  proveedor,
  nroCotizacion,
  moneda,
  metodoPago,
  vencimiento,
  incluyeIgv,
  montoIgv,
  totalAntesIgv,
  totalDespuesIgv,
  observacion,
  isCollapsed,
}: CabeceraDetalleCotizacionProps) => {
  const smb = moneda === "Soles" ? "S/." : "$";

  if (isCollapsed) {
    return (
      <div className="py-2 px-3 group-header cursor-pointer hover:bg-white/2 transition-colors">
        <Group justify="space-between" wrap="nowrap">
          <Stack gap={0} className="flex-1 min-w-0">
             <Text size="xs" fw={900} className="text-white truncate uppercase">{proveedor}</Text>
             <Text size="10px" c="dimmed" fw={700}>{nroCotizacion}</Text>
          </Stack>
          <Badge variant="filled" color="cyan" size="xs">
            {smb} {formatNumber(totalDespuesIgv)}
          </Badge>
        </Group>
      </div>
    );
  }

  return (
    <Stack gap="sm" className="p-4 bg-zinc-950 border-x border-t border-zinc-800/80 h-full">
      <Group wrap="nowrap" align="flex-start" justify="space-between">
        <Stack gap={2} className="flex-1">
          <Group gap={6}>
            <BuildingStorefrontIcon className="w-4 h-4 text-indigo-400" />
            <Text size="sm" fw={900} className="text-indigo-100 uppercase tracking-tight">{proveedor}</Text>
          </Group>
          <Text size="xs" c="dimmed" fw={700} className="font-mono">REF: {nroCotizacion}</Text>
        </Stack>
        <Badge variant="dot" color="cyan" size="sm" className="font-bold">{moneda}</Badge>
      </Group>

      <Divider color="zinc.8" opacity={0.5} />

      <div className="grid grid-cols-2 gap-2">
        <Paper p={6} radius="lg" className="bg-zinc-950/30 border border-zinc-800/50">
          <Group gap={4} wrap="nowrap"><TagIcon className="w-3 h-3 text-zinc-500" /><Text size="10px" fw={700} c="dimmed" className="uppercase">Pago</Text></Group>
          <Text size="xs" fw={800} className="text-white mt-0.5">{metodoPago}</Text>
        </Paper>
        <Paper p={6} radius="lg" className="bg-zinc-950/30 border border-zinc-800/50">
          <Group gap={4} wrap="nowrap"><CalendarDaysIcon className="w-3 h-3 text-zinc-500" /><Text size="10px" fw={700} c="dimmed" className="uppercase">Vencimiento</Text></Group>
          <Text size="xs" fw={800} className="text-white mt-0.5">{vencimiento ? dayjs(vencimiento).format("DD/MM/YYYY") : "---"}</Text>
        </Paper>
      </div>

      <Stack gap={4} p="xs" className="bg-linear-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800/80 shadow-lg">
        <Group justify="space-between"><Text size="xs" c="dimmed" fw={700}>SUBTOTAL</Text><Text size="xs" fw={800} className="text-zinc-200">{smb} {formatNumber(totalAntesIgv)}</Text></Group>
        <Group justify="space-between">
          <div className="flex items-center gap-2"><Text size="xs" c="dimmed" fw={700}>IGV</Text><Badge variant="light" color={incluyeIgv ? "teal" : "zinc"} size="9px" radius="xs">{incluyeIgv ? "INCLUIDO" : "MÁS IGV"}</Badge></div>
          <Text size="xs" fw={800} className="text-zinc-200">{smb} {formatNumber(montoIgv)}</Text>
        </Group>
        <Divider color="zinc.8" my={2} />
        <Group justify="space-between"><Text size="sm" fw={900} className="text-cyan-400">TOTAL</Text><Text size="sm" fw={900} className="text-cyan-100 font-mono">{smb} {formatNumber(totalDespuesIgv)}</Text></Group>
      </Stack>

      {observacion && (
        <Group gap="xs" wrap="nowrap" className="px-1">
          <ChatBubbleBottomCenterTextIcon className="w-3 h-3 text-indigo-500" />
          <Text size="10px" c="dimmed" fs="italic" truncate className="flex-1">{observacion}</Text>
        </Group>
      )}
    </Stack>
  );
};
