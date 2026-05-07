import { Group, Stack, Text, Badge } from "@mantine/core";
import {
  BuildingStorefrontIcon,
  TruckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { formatNumber } from "../../../../../../shared/functions/formatNumber";
import { Estado_Cotizacion_Detalle } from "../../../../../../shared/enums/cotizacion/cotizacion";
import type { RES_CotizacionDetalle } from "../../../../../../service/responses/cotizaciones/cotizacion";

interface CotizacionDetalleItemProps {
  det: RES_CotizacionDetalle;
  moneda: string;
}

export const CotizacionDetalleItem = ({
  det,
  moneda,
}: CotizacionDetalleItemProps) => {
  const subtotal = Number(det.cantidad) * Number(det.precio_unitario);

  return (
    <div className="bg-zinc-900/70 rounded-xl border border-zinc-800/40 px-4 py-3 hover:border-indigo-500/20 transition-colors">
      <div className="flex justify-between items-start gap-4">
        {/* Info izquierda */}
        <Stack gap={3} className="flex-1">
          {/* Nombre + estado + flags */}
          <Group gap="xs">
            <Text
              size="sm"
              fw={800}
              className={
                det.estado === Estado_Cotizacion_Detalle.Rechazado
                  ? "text-zinc-500 line-through"
                  : "text-zinc-100"
              }
            >
              {det.producto}
            </Text>
            {det.estado === Estado_Cotizacion_Detalle.Aprobado && (
              <Badge
                size="xs"
                color="teal"
                variant="light"
                className="border-teal-500/20"
              >
                Aprobado
              </Badge>
            )}
            {det.estado === Estado_Cotizacion_Detalle.Rechazado && (
              <Badge
                size="xs"
                color="red"
                variant="light"
                className="border-red-500/20"
              >
                Rechazado
              </Badge>
            )}
            {det.estado === Estado_Cotizacion_Detalle.Pendiente && (
              <Badge
                size="xs"
                color="gray"
                variant="light"
                className="border-zinc-500/20 text-zinc-300"
              >
                Pendiente
              </Badge>
            )}
            {det.es_auditable && (
              <Badge size="xs" color="orange" variant="dot">
                Auditable
              </Badge>
            )}
            {det.es_perecible && (
              <Badge size="xs" color="pink" variant="dot">
                Perecible
              </Badge>
            )}
          </Group>

          {/* Cantidad + unidad */}
          <Group gap={8} wrap="nowrap" align="center">
            <Text
              size="11px"
              fw={700}
              className={
                det.estado === Estado_Cotizacion_Detalle.Rechazado
                  ? "text-zinc-600"
                  : "text-white"
              }
            >
              {formatNumber(det.cantidad)} {det.unidad_medida_ctz_abv}
            </Text>

            {det.id_unidad_medida_base !== det.id_unidad_medida_ctz && (
              <Group gap={8} wrap="nowrap" align="center">
                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                <Text size="11px" fw={700} c="zinc.5">
                  {formatNumber(det.contenido_por_presentacion)}
                  {det.unidad_medida_base_abv}{" "}
                  <span className="text-[10px] lowercase opacity-70">x</span>{" "}
                  {det.unidad_medida_ctz_abv}
                </Text>
                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                <Text size="11px" fw={700} c="indigo.4">
                  {formatNumber(det.cantidad * det.contenido_por_presentacion)}{" "}
                  {det.unidad_medida_base_abv}
                </Text>
              </Group>
            )}
          </Group>

          {/* Logística: almacén, despacho, tiempo */}
          <Group gap="xs" wrap="wrap">
            {det.almacen_recepcionista && (
              <Group gap={4} wrap="nowrap">
                <BuildingStorefrontIcon className="w-3 h-3 text-zinc-500 shrink-0" />
                <Text size="xs" c="dimmed">
                  {det.almacen_recepcionista}
                  {Boolean(det.para_un_almacen_principal) && (
                    <span className="text-indigo-400/70 ml-1">(principal)</span>
                  )}
                </Text>
              </Group>
            )}
            {det.tipo_despacho && (
              <Group gap={4} wrap="nowrap">
                <TruckIcon className="w-3 h-3 text-zinc-500 shrink-0" />
                <Text size="xs" c="dimmed">
                  {det.tipo_despacho}
                  {det.lugar_recojo && (
                    <span className="text-zinc-400 ml-1">
                      · {det.lugar_recojo}
                    </span>
                  )}
                </Text>
              </Group>
            )}
            {det.tiempo_entrega_dias !== null &&
              det.tiempo_entrega_dias > 0 && (
                <Group gap={4} wrap="nowrap">
                  <ClockIcon className="w-3 h-3 text-zinc-500 shrink-0" />
                  <Text size="xs" c="dimmed">
                    {det.tiempo_entrega_dias === 1
                      ? "1 día"
                      : `${det.tiempo_entrega_dias} días`}
                  </Text>
                </Group>
              )}
          </Group>
        </Stack>

        {/* Precio unitario + Subtotal */}
        <Group gap="xs" wrap="nowrap" className="shrink-0">
          <Badge variant="light" color="pink" size="sm" radius="md">
            {moneda === "Soles" ? "S/." : "$"}{" "}
            {formatNumber(Number(det.precio_unitario))} /{" "}
            {det.unidad_medida_ctz_abv}
          </Badge>
          <Badge variant="filled" color="pink" size="sm" radius="md">
            Sub: {moneda === "Soles" ? "S/." : "$"} {formatNumber(subtotal)}
          </Badge>
        </Group>
      </div>

      {/* Comentario */}
      {det.comentario && (
        <div className="mt-3 pt-2 border-t border-zinc-800/50">
          <Text
            size="xs"
            c="dimmed"
            fw={800}
            className="uppercase tracking-widest mb-1"
          >
            Comentario
          </Text>
          <div className="flex gap-2">
            <div className="w-0.5 rounded-full bg-indigo-500/40 shrink-0" />
            <Text size="xs" className="italic text-zinc-400 leading-relaxed">
              {det.comentario}
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};
