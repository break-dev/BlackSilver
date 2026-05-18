import { Group, Text, Badge } from "@mantine/core";
import { CubeIcon } from "@heroicons/react/24/outline";
import { cn } from "../../../../../shared/functions/cn";
import { formatNumber } from "../../../../../shared/functions/formatNumber";
import type { RES_OrdenCompraRecepcionDetalle } from "../../../../../service/responses/ordenes-compra/orden-compra-recepcion";
import { TipoBien } from "../../../../../shared/enums/_generic/tipo-bien";

interface Props {
  detalle: RES_OrdenCompraRecepcionDetalle;
  requiresTransfer: boolean;
}

export const RecepcionDetalleCard = ({ detalle, requiresTransfer }: Props) => {
  const cantRecepcionada = detalle.cantidad_recepcionada_base;
  const cantTransferida = detalle.cantidad_transferida_base || 0;
  const isFullyTransferred = cantTransferida >= cantRecepcionada;
  const isPartiallyTransferred =
    cantTransferida > 0 && cantTransferida < cantRecepcionada;

  return (
    <div
      className={cn(
        "p-4 rounded-2xl border transition-all flex justify-between items-center relative overflow-hidden group/item",
        requiresTransfer
          ? isFullyTransferred
            ? "bg-emerald-500/5 border-emerald-500/20"
            : isPartiallyTransferred
              ? "bg-orange-500/5 border-orange-500/20"
              : "bg-zinc-950/40 border-indigo-500/20 hover:border-indigo-500/50"
          : "bg-zinc-950/60 border-zinc-800/40 hover:border-emerald-500/30",
      )}
    >
      <div
        className={cn(
          "absolute left-0 top-0 w-1 h-full transition-colors",
          requiresTransfer
            ? isFullyTransferred
              ? "bg-emerald-500"
              : isPartiallyTransferred
                ? "bg-orange-500"
                : "bg-indigo-500/30 group-hover/item:bg-indigo-500"
            : "bg-zinc-800/0 group-hover/item:bg-emerald-500/50",
        )}
      />

      <div className="flex flex-col gap-1.5 pl-2 z-10 w-full pr-4">
        <div className="flex flex-row justify-start gap-2">
          <Text size="xs" fw={900} className="text-white leading-tight">
            {detalle.producto}
          </Text>
          {detalle.tipo_bien == TipoBien.ActivoFijo && (
            <Text size="xs" fw={500} className="text-white leading-tight">
              {detalle.correlativo_activo_fijo}
            </Text>
          )}
        </div>

        <Group gap="xs" wrap="nowrap" align="center">
          <CubeIcon
            className={cn(
              "w-3.5 h-3.5",
              requiresTransfer
                ? isFullyTransferred
                  ? "text-emerald-400"
                  : isPartiallyTransferred
                    ? "text-orange-400"
                    : "text-indigo-400"
                : "text-zinc-500",
            )}
          />
          <Text
            size="10px"
            fw={800}
            c="zinc.4"
            className="uppercase tracking-widest leading-none"
          >
            Recibido:
          </Text>
          <Badge
            variant="light"
            color={
              requiresTransfer
                ? isFullyTransferred
                  ? "emerald"
                  : isPartiallyTransferred
                    ? "orange"
                    : "indigo"
                : "zinc"
            }
            size="sm"
            className="font-bold tracking-wider"
          >
            {formatNumber(detalle.cantidad_recepcionada)}{" "}
            {detalle.unidad_medida_oc_abv}
          </Badge>

          {requiresTransfer && (
            <Badge
              variant="dot"
              color={
                isFullyTransferred
                  ? "emerald"
                  : isPartiallyTransferred
                    ? "orange"
                    : "indigo"
              }
              size="xs"
              className="font-bold uppercase tracking-tighter"
            >
              {isFullyTransferred
                ? "Transferido"
                : isPartiallyTransferred
                  ? "Parcial"
                  : "Pendiente"}
            </Badge>
          )}
        </Group>
      </div>

      <div className="text-right pl-4 pr-1 border-l border-zinc-800/50 min-w-max z-10 flex flex-col items-end justify-center">
        <Group gap="2" wrap="nowrap" align="center">
          <Text
            size="11px"
            fw={900}
            className={cn(
              "font-mono leading-none",
              requiresTransfer
                ? isFullyTransferred
                  ? "text-emerald-400"
                  : isPartiallyTransferred
                    ? "text-orange-400"
                    : "text-indigo-400"
                : "text-emerald-400",
            )}
          >
            +{formatNumber(detalle.cantidad_recepcionada_base)}
          </Text>
          <Text
            size="11px"
            fw={900}
            c="zinc.5"
            className="uppercase tracking-widest bg-zinc-900 px-2 py-0.5 rounded-md inline-block mr-1"
          >
            {detalle.unidad_medida_base_abv || "UNI"}
          </Text>
        </Group>
      </div>
    </div>
  );
};
