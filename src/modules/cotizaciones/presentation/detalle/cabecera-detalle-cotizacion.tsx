import { useState } from "react";
import { Group, Stack, Text, Badge, Divider, Button, Collapse } from "@mantine/core";
import { formatNumber } from "../../../../shared/functions/formatNumber";
import {
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckBadgeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { Estado_Cotizacion } from "../../../../shared/enums/cotizacion/cotizacion";

interface CabeceraDetalleCotizacionProps {
  proveedor: string;
  nroCotizacion: string;
  moneda: string;
  metodoPago: string;
  empresas: { id_empresa: number; razon_social: string }[];
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
  empresas,
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
  const [showEmpresas, setShowEmpresas] = useState(false);
  const smb = moneda === "Soles" ? "S/." : "$";

  // Colores para los estados usando el enum
  const getEstadoColor = (est: string) => {
    switch (est) {
      case Estado_Cotizacion.Generada:
        return "indigo";
      case Estado_Cotizacion.Aprobada:
        return "teal";
      default:
        return "zinc";
    }
  };

  const showButton = estado === Estado_Cotizacion.Generada;

  if (isCollapsed) {
    return (
      <div className="py-3 px-4 group-header cursor-pointer hover:bg-white/2 transition-colors">
        <Group justify="space-between" wrap="nowrap" align="flex-start">
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
          <Badge variant="filled" color="cyan" size="md" className="mt-1 shrink-0 font-mono shadow-md">
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

      {/* Empresas Compradoras Toggle */}
      {empresas && empresas.length > 0 && (
        <Stack gap={0} className="bg-zinc-900/40 rounded-xl border border-zinc-800/50 overflow-hidden">
          <div 
            onClick={() => setShowEmpresas(!showEmpresas)}
            className="p-2 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
          >
            <Group gap={4} wrap="nowrap">
              <BuildingStorefrontIcon className="w-3.5 h-3.5 text-emerald-500" />
              <Text size="10px" fw={800} className="text-zinc-200 uppercase">
                Empresas Asociadas ({empresas.length})
              </Text>
            </Group>
            {showEmpresas ? (
              <ChevronUpIcon className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <ChevronDownIcon className="w-3.5 h-3.5 text-zinc-500" />
            )}
          </div>
          <Collapse in={showEmpresas}>
            <div className="p-2 pt-1 flex flex-wrap gap-1.5">
              {empresas.map((emp) => (
                <div 
                  key={emp.id_empresa} 
                  className="bg-zinc-900/70 rounded-lg border border-zinc-800/80 px-2.5 py-1.5 flex items-center gap-1.5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 shadow-[0_0_4px_rgba(16,185,129,0.5)] shrink-0" />
                  <Text size="11px" fw={700} className="text-zinc-300 leading-tight truncate">
                    {emp.razon_social}
                  </Text>
                </div>
              ))}
            </div>
          </Collapse>
        </Stack>
      )}

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
