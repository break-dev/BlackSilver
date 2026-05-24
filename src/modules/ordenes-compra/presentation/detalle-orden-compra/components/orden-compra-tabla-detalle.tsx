import { Badge, Button, Checkbox, Group, Table, Text } from "@mantine/core";
import {
  ArchiveBoxArrowDownIcon,
  ClockIcon as HistoryIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import type {
  RES_OrdenCompra,
  RES_OrdenCompraDetalle,
} from "../../../../../service/responses/ordenes-compra/orden-compra";
import { OrdenCompraFilaDetalle } from "./orden-compra-fila-detalle";
import { TipoBien } from "../../../../../shared/enums/_generic/tipo-bien";

interface OrdenCompraTablaDetalleProps {
  orden: RES_OrdenCompra;
  detalles: RES_OrdenCompraDetalle[];
  detallesDisponibles: RES_OrdenCompraDetalle[];
  selectedIds: number[];
  onSelectAllNormal: () => void;
  onSelectAllAsset: () => void;
  onSelectOne: (id: number) => void;
  onOpenHistorial: () => void;
  onOpenComprobantes: () => void;
  onOpenRecepcion: () => void;
  onOpenTrace: (idDetalle: number, nombre: string) => void;
  symbol: string;
}

export const OrdenCompraTablaDetalle = ({
  orden,
  detalles,
  detallesDisponibles,
  selectedIds,
  onSelectAllNormal,
  onSelectAllAsset,
  onSelectOne,
  onOpenHistorial,
  onOpenComprobantes,
  onOpenRecepcion,
  onOpenTrace,
  symbol,
}: OrdenCompraTablaDetalleProps) => {
  const normalProducts = detalles.filter(
    (d) => d.tipo_bien !== TipoBien.ActivoFijo,
  );
  const assetProducts = detalles.filter(
    (d) => d.tipo_bien === TipoBien.ActivoFijo,
  );

  const normalDisponibles = detallesDisponibles.filter(
    (d) => d.tipo_bien !== TipoBien.ActivoFijo,
  );
  const assetDisponibles = detallesDisponibles.filter(
    (d) => d.tipo_bien === TipoBien.ActivoFijo,
  );

  const allNormalSelected =
    normalDisponibles.length > 0 &&
    normalDisponibles.every((d) =>
      selectedIds.includes(d.id_orden_compra_detalle),
    );
  const someNormalSelected =
    normalDisponibles.some((d) =>
      selectedIds.includes(d.id_orden_compra_detalle),
    ) && !allNormalSelected;

  const allAssetSelected =
    assetDisponibles.length > 0 &&
    assetDisponibles.every((d) =>
      selectedIds.includes(d.id_orden_compra_detalle),
    );
  const someAssetSelected =
    assetDisponibles.some((d) =>
      selectedIds.includes(d.id_orden_compra_detalle),
    ) && !allAssetSelected;

  const selectedDetails = detalles.filter((d) =>
    selectedIds.includes(d.id_orden_compra_detalle),
  );
  const hasSelectedAsset = selectedDetails.some(
    (d) => d.tipo_bien === TipoBien.ActivoFijo,
  );
  const hasSelectedNormal = selectedDetails.some(
    (d) => d.tipo_bien !== TipoBien.ActivoFijo,
  );

  return (
    <div className="space-y-4 px-2">
      <Group justify="space-between" align="center" px={4}>
        <Group gap="xs">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg">
            <ListBulletIcon className="w-5 h-5 text-indigo-400" />
          </div>
          <Text
            fw={800}
            className="text-zinc-100 italic tracking-tight text-lg"
          >
            Detalle de Productos
          </Text>
        </Group>
        <Group gap="xs">
          <Button
            variant="light"
            color="indigo"
            size="xs"
            radius="xl"
            onClick={onOpenHistorial}
          >
            Historial Recepciones
          </Button>
          <Button
            variant="light"
            color="cyan"
            size="xs"
            radius="xl"
            leftSection={<HistoryIcon className="w-4 h-4" />}
            className="font-bold border border-zinc-800"
            onClick={onOpenComprobantes}
          >
            Comprobantes
          </Button>
          {detallesDisponibles.length > 0 && (
            <Button
              variant="gradient"
              gradient={{ from: "indigo.6", to: "cyan.6" }}
              size="xs"
              radius="xl"
              leftSection={<ArchiveBoxArrowDownIcon className="w-4 h-4" />}
              className="font-bold shadow-lg shadow-indigo-500/20"
              onClick={onOpenRecepcion}
              disabled={
                selectedIds.length === 0 || orden.estado === "Completada"
              }
            >
              Nueva Recepción
            </Button>
          )}
          <Badge
            variant="light"
            color="indigo"
            radius="md"
            size="sm"
            className="font-bold py-3 px-4 uppercase tracking-widest"
          >
            {detalles.length} {detalles.length === 1 ? "Producto" : "Productos"}
          </Badge>
        </Group>
      </Group>
      {(() => {
        return (
          <div className="overflow-hidden border border-zinc-800 rounded-2xl shadow-2xl bg-zinc-950/20">
            <Table verticalSpacing="md" horizontalSpacing="xl">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 text-xs font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-center w-12">#</th>
                  <th className="px-6 py-4 text-center w-16">Sel.</th>
                  <th className="px-6 py-4 text-left">Producto</th>
                  <th className="px-6 py-4 text-center">Destino / Entrega</th>
                  <th className="px-6 py-4 text-center">Cant. Solicitada</th>
                  <th className="px-6 py-4 text-center">Costo</th>
                  <th className="px-6 py-4 text-center">Progreso Rec.</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center w-16">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {/* Grupo 1: Productos de Consumo Común */}
                {normalProducts.length > 0 && (
                  <>
                    <tr className="bg-zinc-900/40 border-y border-zinc-800/80">
                      <td colSpan={9} className="px-6 py-2.5">
                        <Group gap="xs">
                          <Checkbox
                            checked={allNormalSelected}
                            indeterminate={someNormalSelected}
                            onChange={onSelectAllNormal}
                            disabled={
                              normalDisponibles.length === 0 || hasSelectedAsset
                            }
                            size="xs"
                            color="indigo"
                            className="cursor-pointer"
                          />
                          <Badge
                            variant="light"
                            color="indigo"
                            radius="sm"
                            size="xs"
                            className="font-bold uppercase tracking-wider"
                          >
                            Productos de Consumo Común ({normalProducts.length})
                          </Badge>
                        </Group>
                      </td>
                    </tr>
                    {normalProducts.map((det, idx) => (
                      <OrdenCompraFilaDetalle
                        key={det.id_orden_compra_detalle}
                        det={det}
                        idx={idx}
                        isSelected={selectedIds.includes(
                          det.id_orden_compra_detalle,
                        )}
                        isDisabled={hasSelectedAsset}
                        onSelect={onSelectOne}
                        onOpenTrace={onOpenTrace}
                        symbol={symbol}
                      />
                    ))}
                  </>
                )}

                {/* Grupo 2: Activos Fijos */}
                {assetProducts.length > 0 && (
                  <>
                    <tr className="bg-zinc-900/40 border-y border-zinc-800/80">
                      <td colSpan={9} className="px-6 py-2.5">
                        <Group gap="xs">
                          <Checkbox
                            checked={allAssetSelected}
                            indeterminate={someAssetSelected}
                            onChange={onSelectAllAsset}
                            disabled={
                              assetDisponibles.length === 0 || hasSelectedNormal
                            }
                            size="xs"
                            color="violet"
                            className="cursor-pointer"
                          />
                          <Badge
                            variant="light"
                            color="violet"
                            radius="sm"
                            size="xs"
                            className="font-bold uppercase tracking-wider"
                          >
                            Activos Fijos ({assetProducts.length})
                          </Badge>
                          <Text
                            size="11px"
                            c="violet.4"
                            fw={500}
                            className="italic ml-2"
                          >
                            * Los activos fijos se recepcionan por separado.
                          </Text>
                        </Group>
                      </td>
                    </tr>
                    {assetProducts.map((det, idx) => (
                      <OrdenCompraFilaDetalle
                        key={det.id_orden_compra_detalle}
                        det={det}
                        idx={idx}
                        isSelected={selectedIds.includes(
                          det.id_orden_compra_detalle,
                        )}
                        isDisabled={hasSelectedNormal}
                        onSelect={onSelectOne}
                        onOpenTrace={onOpenTrace}
                        symbol={symbol}
                      />
                    ))}
                  </>
                )}
              </tbody>
            </Table>
          </div>
        );
      })()}
    </div>
  );
};
