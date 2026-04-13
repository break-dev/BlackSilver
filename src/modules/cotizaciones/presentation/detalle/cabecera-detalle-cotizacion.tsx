import { Group, Stack, Text, Badge, Divider, Button } from "@mantine/core";
import { formatNumber } from "../../../../shared/functions/formatNumber";
import {
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { EstadoCotizacion } from "../../../../shared/enums/estados";

interface CabeceraDetalleCotizacionProps {
  proveedor: string;
  nroCotizacion: string;
  moneda: string;
  metodoPago: string;
  vencimiento?: string | null;
  incluyeIgv: boolean;
  porcentajeIgv: number;
  montoIgv: number;
  totalAntesIgv: number;
  totalDespuesIgv: number;
  observacion?: string | null;
  estado: string;
  idCotizacion: number;
  onApprove?: (id: number) => void;
  loading?: boolean;
  isCollapsed: boolean;
}

export const CabeceraDetalleCotizacion = ({
  proveedor,
  nroCotizacion,
  moneda,
  metodoPago,
  vencimiento,
  incluyeIgv,
  porcentajeIgv,
  montoIgv,
  totalAntesIgv,
  totalDespuesIgv,
  observacion,
  estado,
  idCotizacion,
  onApprove,
  loading,
  isCollapsed,
}: CabeceraDetalleCotizacionProps) => {
  const smb = moneda === "Soles" ? "S/." : "$";

  // Colores para los estados usando el enum
  const getEstadoColor = (est: string) => {
    switch (est) {
      case EstadoCotizacion.Generada:
        return "indigo";
      case EstadoCotizacion.Aprobada:
        return "teal";
      case EstadoCotizacion.Desestimada:
        return "red";
      default:
        return "zinc";
    }
  };

  const showButton = estado === EstadoCotizacion.Generada;

  if (isCollapsed) {
    return (
      <div className="py-2 px-3 group-header cursor-pointer hover:bg-white/2 transition-colors">
        <Group justify="space-between" wrap="nowrap">
          <Stack gap={0} className="flex-1 min-w-0">
            <Group gap={6} wrap="nowrap">
              <Text
                size="xs"
                fw={900}
                className="text-white truncate uppercase"
              >
                {proveedor}
              </Text>
              <Badge
                variant="outline"
                color={getEstadoColor(estado)}
                size="9px"
                radius="xs"
                className="font-bold"
              >
                {estado}
              </Badge>
            </Group>
            <Text size="10px" c="dimmed" fw={700}>
              {nroCotizacion}
            </Text>
          </Stack>
          <Badge variant="filled" color="cyan" size="xs">
            {smb} {formatNumber(totalDespuesIgv)}
          </Badge>
        </Group>
      </div>
    );
  }

  return (
    <Stack gap="sm" className="p-4 bg-zinc-950 h-full">
      {/* Línea Superior: Proveedor, Correlativo y Acción */}
      <Group wrap="nowrap" align="center" justify="space-between">
        <Stack gap={4} className="flex-1 min-w-0">
          <Group gap={6} wrap="nowrap" align="center">
            <BuildingStorefrontIcon className="w-4 h-4 text-indigo-400 shrink-0" />
            <Text
              size="sm"
              fw={900}
              className="text-indigo-100 uppercase tracking-tight truncate"
            >
              {proveedor}
            </Text>
            <Badge
              variant="filled"
              color="indigo.9"
              size="xs"
              radius="sm"
              className="font-bold border border-indigo-500/30 shrink-0"
            >
              {nroCotizacion}
            </Badge>
          </Group>
          <Group gap={8} wrap="nowrap">
            <Badge
              variant="light"
              color={getEstadoColor(estado)}
              size="xs"
              radius="xs"
              className="font-bold border border-current/10"
            >
              {estado}
            </Badge>
          </Group>
        </Stack>

        {showButton && (
          <Button
            variant="filled"
            color="green"
            size="xs"
            radius="md"
            loading={loading}
            leftSection={<CheckBadgeIcon className="w-3.5 h-3.5" />}
            className="shadow-lg shadow-green-900/20 active:scale-95 transition-transform h-8 px-4"
            onClick={() => onApprove?.(idCotizacion)}
          >
            Aprobar
          </Button>
        )}
      </Group>

      {/* Línea de Info: Moneda | Pago | Vencimiento */}
      <Group
        gap="xs"
        wrap="nowrap"
        className="bg-zinc-900/40 p-2 rounded-xl border border-zinc-800/50"
      >
        <Group gap={4} wrap="nowrap">
          <CurrencyDollarIcon className="w-3.5 h-3.5 text-zinc-500" />
          <Text size="10px" fw={800} className="text-zinc-200 uppercase">
            {moneda}
          </Text>
        </Group>
        <Divider orientation="vertical" color="zinc.8" />
        <Group gap={4} wrap="nowrap">
          <CreditCardIcon className="w-3.5 h-3.5 text-zinc-500" />
          <Text size="10px" fw={800} className="text-zinc-200 uppercase">
            {metodoPago}
          </Text>
        </Group>
        {vencimiento && (
          <>
            <Divider orientation="vertical" color="zinc.8" />
            <Group gap={4} wrap="nowrap">
              <CalendarDaysIcon className="w-3.5 h-3.5 text-zinc-500" />
              <Text size="10px" fw={800} className="text-zinc-200 uppercase">
                Vence: {dayjs(vencimiento).format("DD/MM/YYYY")}
              </Text>
            </Group>
          </>
        )}
      </Group>

      {/* Stack de Totales Mejorado */}
      <Stack
        gap={4}
        p="xs"
        className="bg-linear-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800/80 shadow-lg mt-auto"
      >
        <Group justify="space-between">
          <Text size="10px" c="dimmed" fw={800}>
            SUBTOTAL (NETO)
          </Text>
          <Text size="xs" fw={800} className="text-zinc-200">
            {smb} {formatNumber(totalAntesIgv)}
          </Text>
        </Group>

        <Group justify="space-between">
          <Text size="10px" c="dimmed" fw={800}>
            IGV ({porcentajeIgv}%)
          </Text>
          <Text size="xs" fw={800} className="text-zinc-200">
            {smb} {formatNumber(montoIgv)}
          </Text>
        </Group>

        <Divider color="zinc.8" my={2} variant="dashed" />

        <Group justify="space-between">
          <Text size="sm" fw={900} className="text-cyan-400">
            TOTAL
          </Text>
          <Text size="sm" fw={900} className="text-cyan-100 font-mono">
            {smb} {formatNumber(totalDespuesIgv)}
          </Text>
        </Group>

        {/* Indicador sutil de origen */}
        <Text
          size="9px"
          c={incluyeIgv ? "teal.6" : "amber.6"}
          fw={700}
          className="text-center opacity-80 mt-1 uppercase italic"
        >
          * Precios {incluyeIgv ? "ya incluyen" : "no consideran"} el IGV
        </Text>
      </Stack>

      {observacion && (
        <Stack gap={2} px={1} className="mt-2">
          <Group gap={4}>
            <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-indigo-400 shrink-0" />
            <Text
              size="10px"
              fw={900}
              className="text-zinc-500 uppercase flex-1"
            >
              Observación
            </Text>
          </Group>
          <Text size="xs" c="dimmed" className="leading-tight pl-6">
            {observacion}
          </Text>
        </Stack>
      )}
    </Stack>
  );
};
