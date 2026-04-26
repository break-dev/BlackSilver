import {
  Group,
  Paper,
  Stack,
  Text,
  Badge,
  ActionIcon,
  Button,
  Checkbox,
  Alert,
  Switch,
  Divider,
} from "@mantine/core";
import { PlusIcon, TrashIcon, CubeIcon } from "@heroicons/react/24/outline";
import { formatNumber } from "../../../../../shared/functions/formatNumber";
import type {
  GroupedReceptionOC,
  DTO_RecepcionLotExtendido,
} from "../../../hooks/useRegistroRecepcionOC";
import type { RES_LoteDisponible } from "../../../../../service/responses/lote-producto";
import { LotesDisponiblesTableOC } from "./LotesDisponiblesTableOC";
import { NuevoLoteFormOC } from "./NuevoLoteFormOC";

interface Props {
  group: GroupedReceptionOC;
  groupIndex: number;
  toggleSelection: () => void;
  setLotValue: <K extends keyof DTO_RecepcionLotExtendido>(
    groupIndex: number,
    lotIndex: number,
    field: K,
    value: DTO_RecepcionLotExtendido[K],
  ) => void;
  addLot: (groupIndex: number) => void;
  removeLot: (groupIndex: number, lotIndex: number) => void;
  updateTabularAdjustment: (
    groupIndex: number,
    lotIndex: number,
    idLote: number,
    isActive: boolean,
    qty?: number,
  ) => void;
  getLotError: (
    groupIndex: number,
    lotIndex: number,
    field: keyof DTO_RecepcionLotExtendido,
  ) => string | null;
  allLotes: RES_LoteDisponible[];
  loadingLotes: boolean;
  cantidadTotalError?: string;
}

export const ProductoRecepcionCardOC = ({
  group,
  groupIndex,
  toggleSelection,
  setLotValue,
  addLot,
  removeLot,
  updateTabularAdjustment,
  getLotError,
  allLotes,
  loadingLotes,
  cantidadTotalError,
}: Props) => {
  const productLots = allLotes.filter(
    (l) => l.id_producto === group.id_producto,
  );

  return (
    <Paper
      shadow="md"
      radius="lg"
      className={`border overflow-hidden relative transition-all duration-200 ${
        group.selected
          ? "bg-zinc-900/30 border-indigo-500/40"
          : "bg-zinc-950/40 border-zinc-800/80 opacity-70"
      }`}
    >
      {/* Header del Producto */}
      <div
        className={`border-b p-4 px-5 transition-colors ${
          group.selected
            ? "bg-zinc-900/60 border-zinc-800/50"
            : "bg-zinc-900/30 border-zinc-800/30"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Checkbox
              checked={group.selected}
              onChange={toggleSelection}
              color="indigo"
              size="md"
              className="cursor-pointer"
            />
            <div
              className={`p-2.5 rounded-xl border shadow-inner transition-colors ${
                group.selected
                  ? "bg-linear-to-br from-indigo-500/20 to-indigo-600/5 border-indigo-500/20"
                  : "bg-zinc-800/30 border-zinc-700/30"
              }`}
            >
              <CubeIcon
                className={`w-5 h-5 ${
                  group.selected ? "text-indigo-400" : "text-zinc-500"
                }`}
              />
            </div>
            <div>
              <Text
                size="md"
                fw={900}
                className={`${
                  group.selected ? "text-white" : "text-zinc-400"
                } tracking-tight leading-tight`}
              >
                {group.producto}
              </Text>
              <Group gap="xs" mt={4}>
                <Badge
                  variant="dot"
                  color={group.selected ? "teal" : "gray"}
                  size="xs"
                  className={`${
                    group.selected
                      ? "bg-zinc-800/50 border-zinc-700/50 text-zinc-300"
                      : "bg-zinc-900/50 border-zinc-800/50 text-zinc-500"
                  } font-bold px-3 py-3 rounded-lg`}
                >
                  Pendiente: {formatNumber(group.cantidad_requerida_base)}{" "}
                  {group.unidad_base_abv}
                </Badge>
                {group.es_perecible && (
                  <Badge
                    variant="filled"
                    color={group.selected ? "orange" : "gray"}
                    size="xs"
                    radius="sm"
                    className="px-2 py-3 rounded-lg font-bold"
                  >
                    PERECIBLE
                  </Badge>
                )}
              </Group>
            </div>
          </div>

          {group.selected && (
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
          )}
        </div>
      </div>

      {group.selected && (
        <Stack gap={0}>
          {group.lots.map((lot, lotIndex) => {
            const esNuevoLote = lot.es_nuevo_lote;

            return (
              <div key={lotIndex} className="p-5 space-y-4 relative group/lot">
                {lotIndex > 0 && (
                  <Divider color="zinc.8" variant="dashed" mb="md" />
                )}
                <div className="flex justify-between items-center mb-2">
                  <Text
                    size="xs"
                    fw={800}
                    c="dimmed"
                    className="uppercase tracking-widest"
                  >
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
                    <Text
                      size="xs"
                      fw={700}
                      c={esNuevoLote ? "zinc.4" : "emerald.4"}
                    >
                      Ingresar a Lote Existente
                    </Text>
                    <Switch
                      checked={esNuevoLote}
                      onChange={(e) =>
                        setLotValue(
                          groupIndex,
                          lotIndex,
                          "es_nuevo_lote",
                          e.currentTarget.checked,
                        )
                      }
                      color="indigo"
                      size="sm"
                    />
                    <Text
                      size="xs"
                      fw={700}
                      c={esNuevoLote ? "indigo.3" : "zinc.4"}
                    >
                      Generar Lote Nuevo
                    </Text>
                  </Group>
                </Group>

                {!esNuevoLote && (
                  <div className="bg-zinc-950/20 p-3 rounded-xl border border-zinc-800/30 mb-2 space-y-3">
                    <LotesDisponiblesTableOC
                      lotes={productLots}
                      loading={loadingLotes}
                      selectedAjustes={lot.ajustes ?? {}}
                      onUpdateTabular={(id, active, qty) =>
                        updateTabularAdjustment(
                          groupIndex,
                          lotIndex,
                          id,
                          active,
                          qty,
                        )
                      }
                      maxQty={group.cantidad_requerida_base}
                      unidadBaseAbv={group.unidad_base_abv}
                    />
                  </div>
                )}

                {esNuevoLote && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                    <NuevoLoteFormOC
                      groupIndex={groupIndex}
                      lotIndex={lotIndex}
                      lot={lot}
                      setLotValue={setLotValue}
                      getLotError={getLotError}
                      unidadBaseAbv={group.unidad_base_abv}
                      unidadOCAbv={group.unidad_oc_abv}
                      contenidoPorPresentacion={
                        group.contenido_por_presentacion_oc
                      }
                      esPerecible={group.es_perecible}
                      maxPermitido={group.cantidad_requerida_base}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </Stack>
      )}

      {group.selected && cantidadTotalError && (
        <Alert
          color="red"
          variant="filled"
          icon={<CubeIcon className="w-4 h-4" />}
          m="md"
          radius="md"
        >
          <Text size="xs" fw={700}>
            {cantidadTotalError}
          </Text>
        </Alert>
      )}
    </Paper>
  );
};
