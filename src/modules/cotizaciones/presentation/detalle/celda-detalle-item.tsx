import { Group, Stack, Text, Badge, Divider } from "@mantine/core";
import { formatNumber } from "../../../../shared/functions/formatNumber";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { Estado_Cotizacion_Detalle } from "../../../../shared/enums/cotizacion/cotizacion";

interface CeldaDetalleItemProps {
  cantidad: number;
  precioUnitario: number;
  moneda: string;
  unidadMedida: string;
  contenidoPorPresentacion: number;
  unidadMedidaBase: string;
  comentario?: string | null;
  noCotiza?: boolean;
  estado?: Estado_Cotizacion_Detalle | null;
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
  estado,
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

  const isAprobado = estado === Estado_Cotizacion_Detalle.Aprobado;
  const isRechazado = estado === Estado_Cotizacion_Detalle.Rechazado;
  const isPendiente = estado === Estado_Cotizacion_Detalle.Pendiente;

  const bgClass = isAprobado
    ? "bg-teal-500/10 border-teal-500/20 shadow-teal-900/10"
    : isRechazado
    ? "bg-red-500/10 border-red-500/20"
    : "bg-zinc-800/30 border-zinc-700/50"; // Gris bonito para pendiente
    
  const textClass = isAprobado ? "text-teal-400" : isRechazado ? "text-red-400" : "text-zinc-400";
  const amountClass = isAprobado ? "text-teal-100" : isRechazado ? "text-red-200 line-through" : "text-zinc-200";
  const dividerColor = isAprobado ? "teal.9" : isRechazado ? "red.9" : "zinc.7";

  const badgeColor = isAprobado ? "teal" : isRechazado ? "red" : "gray";

  return (
    <Stack gap={6} className={`w-full h-full min-h-[160px] justify-between p-1 ${isRechazado ? "opacity-70 transition-all" : ""}`}>
      {/* Contenedor Principal Morado/Verde (Estilo Mini-Recibo) */}
      <div className={`${bgClass} border rounded-2xl p-3 shadow-inner flex-1 flex flex-col justify-between transition-colors relative`}>
        {/* Etiqueta de Aprobado/Rechazado/Pendiente */}
        {estado && (
          <Badge 
            variant={isPendiente ? "light" : "filled"} 
            color={badgeColor} 
            size="xs" 
            className="absolute -top-2 -right-2 shadow-lg"
          >
            {estado}
          </Badge>
        )}
        
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
          <Divider color={dividerColor} variant="dashed" opacity={0.3} />
          <Group justify="space-between" wrap="nowrap" align="flex-end">
            <Text size="10px" fw={900} className={`${textClass} uppercase`}>
              Subtotal
            </Text>
            <Text size="sm" fw={950} className={`${amountClass} font-mono`}>
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
