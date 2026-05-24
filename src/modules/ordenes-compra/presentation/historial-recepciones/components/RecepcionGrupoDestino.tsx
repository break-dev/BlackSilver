import { Group, Button, Text, Badge } from "@mantine/core";
import {
  ArrowRightEndOnRectangleIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { cn } from "../../../../../shared/functions/cn";
import type {
  RES_OrdenCompraRecepcion,
  RES_OrdenCompraRecepcionDetalle,
} from "../../../../../service/responses/ordenes-compra/orden-compra-recepcion";
import { RecepcionDetalleCard } from "./RecepcionDetalleCard";

interface Props {
  recepcion: RES_OrdenCompraRecepcion;
  tipoDestino: "almacen" | "mina";
  idDestino: number;
  destinoNombre: string;
  detalles: RES_OrdenCompraRecepcionDetalle[];
  onTransfer: (
    tipoDestino: "almacen" | "mina",
    idDestino: number,
    detalles: RES_OrdenCompraRecepcionDetalle[],
    nombreDestino: string,
  ) => void;
}

export const RecepcionGrupoDestino = ({
  recepcion,
  tipoDestino,
  idDestino,
  destinoNombre,
  detalles,
  onTransfer,
}: Props) => {
  const requiresTransfer =
    tipoDestino === "mina" || idDestino !== recepcion.id_almacen_recepcionista;

  const itemsPendingTransfer = detalles.filter(
    (d) => (d.cantidad_transferida_base || 0) < d.cantidad_recepcionada_base,
  );

  const isAllTransferred =
    requiresTransfer && itemsPendingTransfer.length === 0;
  const isPartiallyTransferredGroup =
    requiresTransfer &&
    !isAllTransferred &&
    detalles.some((d) => (d.cantidad_transferida_base || 0) > 0);

  return (
    <div
      className={cn(
        "border rounded-2xl overflow-hidden transition-all duration-300",
        requiresTransfer
          ? isAllTransferred
            ? "border-emerald-500/30 bg-emerald-500/5 shadow-none border-l-4 border-l-emerald-500"
            : isPartiallyTransferredGroup
              ? "border-orange-500/30 bg-orange-500/5 border-l-4 border-l-orange-500"
              : "border-indigo-500/40 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.05)] border-l-4 border-l-indigo-500"
          : "border-zinc-800/50 bg-zinc-900/20",
      )}
    >
      <div
        className={cn(
          "px-5 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b",
          requiresTransfer
            ? isAllTransferred
              ? "bg-emerald-500/10 border-emerald-500/20"
              : isPartiallyTransferredGroup
                ? "bg-orange-500/10 border-orange-500/20"
                : "bg-indigo-500/10 border-indigo-500/20"
            : "bg-zinc-800/20 border-zinc-800/50",
        )}
      >
        <Group gap="sm">
          <div
            className={cn(
              "p-2 rounded-xl border transition-colors",
              requiresTransfer
                ? "bg-indigo-500/20 border-indigo-500/30"
                : "bg-zinc-800/40 border-zinc-800/60",
            )}
          >
            {tipoDestino === "mina" ? (
              <MapPinIcon className="w-4 h-4 text-indigo-400" />
            ) : requiresTransfer ? (
              <ArrowRightEndOnRectangleIcon className="w-4 h-4 text-indigo-400" />
            ) : (
              <BuildingStorefrontIcon className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <Text
              size="9px"
              fw={800}
              c={
                requiresTransfer
                  ? isAllTransferred
                    ? "emerald.3"
                    : isPartiallyTransferredGroup
                      ? "orange.3"
                      : "indigo.3"
                  : "zinc.5"
              }
              className="uppercase tracking-widest leading-none"
            >
              {requiresTransfer
                ? isAllTransferred
                  ? "Transferencia Completada"
                  : isPartiallyTransferredGroup
                    ? "Transferencia Parcial"
                    : "Pendiente de Transferencia"
                : "Recepción Directa"}
            </Text>
            <Group gap={6} align="center">
              <Text size="xs" fw={900} className="text-white">
                {tipoDestino === "mina" ? "Hacia Mina: " : requiresTransfer ? "Hacia Almacén: " : "Almacén: "}
                <span
                  className={
                    requiresTransfer ? "text-indigo-200" : "text-emerald-200"
                  }
                >
                  {destinoNombre}
                </span>
              </Text>
            </Group>
          </div>
        </Group>

        {requiresTransfer && !isAllTransferred && (
          <Button
            size="xs"
            variant="light"
            color={isPartiallyTransferredGroup ? "orange" : "indigo"}
            radius="xl"
            className="hover:scale-105 active:scale-95 transition-transform"
            onClick={() => {
              onTransfer(tipoDestino, idDestino, itemsPendingTransfer, destinoNombre);
            }}
          >
            {isPartiallyTransferredGroup
              ? "Completar Transferencia"
              : "Transferir Stock"}
          </Button>
        )}
        {isAllTransferred && (
          <Badge color="emerald" variant="filled" radius="xl" size="sm">
            Transferido
          </Badge>
        )}
      </div>

      <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
        {detalles.map((det) => (
          <RecepcionDetalleCard
            key={det.id_recepcion_detalle}
            detalle={det}
            requiresTransfer={requiresTransfer}
          />
        ))}
      </div>
    </div>
  );
};
