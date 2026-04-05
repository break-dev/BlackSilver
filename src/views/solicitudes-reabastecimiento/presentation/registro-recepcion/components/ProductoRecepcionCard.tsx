import { Badge, Paper, Group, Text, Switch, Alert, Button, Stack, ActionIcon, Divider } from "@mantine/core";
import { CubeIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatNumber } from "../../../../../presentation/functions/formatNumber";
import { NuevoLoteForm } from "./NuevoLoteForm";
import { LotesDisponiblesTable } from "./LotesDisponiblesTable";
import type { GroupedReception, DTO_RecibirLotExtendido } from "../../../hooks/useRegistroRecepcion";
import type { RES_LoteRecepcion } from "../../../service/reabastecimiento.responses";
import type { RES_UnidadMedida } from "../../../../lotes-productos/service/lotes.responses";
import { useProductoRecepcionCard } from "../../../hooks/useProductoRecepcionCard";

interface ProductoRecepcionCardProps {
  group: GroupedReception;
  groupIndex: number;
  setLotValue: <K extends keyof DTO_RecibirLotExtendido>(
    groupIndex: number,
    lotIndex: number,
    field: K,
    value: DTO_RecibirLotExtendido[K],
  ) => void;
  addLot: (groupIndex: number) => void;
  removeLot: (groupIndex: number, lotIndex: number) => void;
  updateTabularAdjustment: (
    groupIndex: number,
    lotIndex: number,
    idLote: number,
    isActive: boolean,
    qty?: number
  ) => void;
  getLotError: (
    groupIndex: number,
    lotIndex: number,
    field: keyof DTO_RecibirLotExtendido,
  ) => string | null;
  unidades: RES_UnidadMedida[];
  loadingUnidades: boolean;
  allLotes: RES_LoteRecepcion[];
  loadingLotes: boolean;
  cantidadTotalError?: string;
}

export const ProductoRecepcionCard = ({
  group,
  groupIndex,
  setLotValue,
  addLot,
  removeLot,
  updateTabularAdjustment,
  getLotError,
  unidades,
  loadingUnidades,
  allLotes,
  loadingLotes,
  cantidadTotalError,
}: ProductoRecepcionCardProps) => {
  const isPerecible = group.es_perecible === 1;
  const targetVencimiento = group.detalles_origen[0].fecha_vencimiento;

  const { lotes } = useProductoRecepcionCard({
    lotesDisponibles: allLotes,
    idProducto: group.detalles_origen[0].id_producto,
    esNuevoLote: false,
    isPerecible,
    targetVencimiento,
  });

  return (
    <Paper
      shadow="md"
      radius="lg"
      className="bg-zinc-900/30 border border-zinc-800/80 overflow-hidden relative"
    >
      {/* Header del Producto */}
      <div className="bg-zinc-900/60 border-b border-zinc-800/50 p-4 px-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-linear-to-br from-indigo-500/20 to-indigo-600/5 border border-indigo-500/20 shadow-inner">
              <CubeIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <Text size="md" fw={900} className="text-white tracking-tight leading-tight">
                {group.producto}
              </Text>
              <Badge
                variant="dot"
                color="teal"
                size="xs"
                mt={2}
                className="bg-zinc-800/50 border-zinc-700/50 text-zinc-300 font-bold px-3 py-3 rounded-lg"
              >
                Total a Recibir: {formatNumber(group.total_entregado_base)} {group.unidad_base_abv}
              </Badge>
            </div>
          </div>
          <Button
            size="compact-xs"
            variant="light"
            color="indigo"
            radius="xl"
            leftSection={<PlusIcon className="w-4 h-4" />}
            onClick={() => addLot(groupIndex)}
          >
            Dividir en otro lote
          </Button>
        </div>
      </div>

      <Stack gap={0}>
        {group.lots.map((lot: DTO_RecibirLotExtendido, lotIndex: number) => {
          const esNuevoLote = lot.es_nuevo_lote;
          const fieldError = getLotError(groupIndex, lotIndex, "id_lote_existente");

          return (
            <div key={lotIndex} className="p-5 space-y-4 relative group/lot">
              {lotIndex > 0 && <Divider color="zinc.8" variant="dashed" mb="md" />}
              <div className="flex justify-between items-center mb-2">
                  <Text size="xs" fw={800} c="dimmed" className="uppercase tracking-widest">
                    Partida #{lotIndex + 1}
                  </Text>
                  {group.lots.length > 1 && (
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => removeLot(groupIndex, lotIndex)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </ActionIcon>
                  )}
                </div>

              <Group justify="space-between">
                <Group gap="xs">
                   <Text size="xs" fw={700} c={esNuevoLote ? "zinc.4" : "emerald.4"}>
                     Ingresar a Lote Existente
                   </Text>
                   <Switch
                     checked={esNuevoLote}
                     onChange={(e) => {
                       const checked = e.currentTarget.checked;
                       setLotValue(groupIndex, lotIndex, "es_nuevo_lote", checked);
                     }}
                     color="indigo"
                     size="sm"
                   />
                   <Text size="xs" fw={700} c={esNuevoLote ? "indigo.3" : "zinc.4"}>
                     Generar Lote Nuevo
                   </Text>
                </Group>
              </Group>

              {!esNuevoLote && (
                <div className="bg-zinc-950/20 p-3 rounded-xl border border-zinc-800/30 mb-2 space-y-3">
                  <LotesDisponiblesTable
                    lotes={lotes}
                    loading={loadingLotes}
                    selectedAjustes={lot.ajustes || {}}
                    onUpdateTabular={(id, active, qty) => updateTabularAdjustment(groupIndex, lotIndex, id, active, qty)}
                    unidadBaseAbv={group.unidad_base_abv}
                    maxQty={group.total_entregado_base}
                  />
                  {fieldError && (
                    <Text size="xs" color="red" mt={4} fw={700}>{fieldError}</Text>
                  )}
                </div>
              )}

              {esNuevoLote && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                  <NuevoLoteForm
                    groupIndex={groupIndex}
                    lotIndex={lotIndex}
                    lot={lot}
                    setLotValue={setLotValue}
                    getLotError={getLotError}
                    unidades={unidades}
                    loadingUnidades={loadingUnidades}
                    unidadBaseAbv={group.unidad_base_abv}
                    esPerecible={isPerecible}
                  />
                </div>
              )}
            </div>
          );
        })}
      </Stack>

      {cantidadTotalError && (
        <Alert color="red" variant="filled" icon={<CubeIcon className="w-4 h-4" />} m="md" radius="md">
          <Text size="xs" fw={700}>{cantidadTotalError}</Text>
        </Alert>
      )}
    </Paper>
  );
};
