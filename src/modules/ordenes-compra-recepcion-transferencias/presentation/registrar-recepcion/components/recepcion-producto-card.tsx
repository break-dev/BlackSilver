import {
  Group,
  Paper,
  Stack,
  Text,
  ActionIcon,
  Button,
  Checkbox,
  Alert,
  Switch,
  Badge,
} from "@mantine/core";
import { PlusIcon, TrashIcon, CubeIcon } from "@heroicons/react/24/outline";
import { formatNumber } from "../../../../../shared/functions/formatNumber";
import type { RES_LoteDisponible } from "../../../../../service/responses/lote-producto";
import { LotesDisponiblesTable } from "./lotes-disponibles-table";
import { NuevoLoteTrans } from "./nuevo-lote";
import type {
  DTO_LoteRecepcionTrans,
  GrupoRecepcionTrans,
} from "../../../hooks/useRegistrarRecepcion";
import { TipoBien } from "../../../../../shared/enums/_generic/tipo-bien";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface Props {
  group: GrupoRecepcionTrans;
  groupIndex: number;
  toggleSelection: () => void;
  setLotValue: <K extends keyof DTO_LoteRecepcionTrans>(
    groupIndex: number,
    lotIndex: number,
    field: K,
    value: DTO_LoteRecepcionTrans[K],
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
    field: keyof DTO_LoteRecepcionTrans,
  ) => string | null;
  allLotes: RES_LoteDisponible[];
  loadingLotes: boolean;
  cantidadTotalError?: string;
}

export const RecepcionProductoCard = ({
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
  const isActivoFijo = group.tipo_bien === TipoBien.ActivoFijo;
  const productLots = allLotes.filter(
    (l) => l.id_producto === group.id_producto,
  );

  return (
    <Paper
      p={0}
      radius="lg"
      className={`border overflow-hidden transition-all duration-300 ${
        group.selected
          ? "bg-zinc-900/10 border-zinc-800"
          : "bg-zinc-950/20 border-zinc-900 opacity-60 grayscale-[0.4]"
      }`}
    >
      {/* Header del Producto */}
      <div
        className={`p-4 px-5 border-b transition-colors ${
          group.selected
            ? "bg-zinc-900/60 border-zinc-800/50"
            : "bg-transparent border-zinc-900/50"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Group gap="md" wrap="nowrap" flex={1}>
            <Checkbox
              checked={group.selected}
              onChange={toggleSelection}
              color="indigo"
              size="sm"
              radius="sm"
              className="cursor-pointer"
            />
            <div
              className={`p-2.5 rounded-xl border transition-colors shadow-inner ${
                group.selected
                  ? "bg-linear-to-br from-indigo-500/20 to-indigo-600/5 border-indigo-500/20"
                  : "bg-zinc-900/50 border-zinc-800"
              }`}
            >
              <CubeIcon
                className={`w-5 h-5 ${group.selected ? "text-indigo-400" : "text-zinc-500"}`}
              />
            </div>
            <div>
              <Text
                size="md"
                fw={900}
                className={`${group.selected ? "text-white" : "text-zinc-400"} tracking-tight leading-tight`}
              >
                {group.producto}
              </Text>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge
                  variant="dot"
                  color="teal"
                  size="xs"
                  className={`bg-zinc-800/50 border-zinc-700/50 text-zinc-300 font-bold px-3 py-3 rounded-lg ${!group.selected && "opacity-50 grayscale"}`}
                >
                  Total a Recibir:{" "}
                  {formatNumber(group.cantidad_transferida_base)}{" "}
                  {group.unidad_medida_base_abv}
                </Badge>
                {group.tipo_bien !== TipoBien.ActivoFijo &&
                  group.lote_correlativo && (
                    <Badge
                      variant="dot"
                      color="yellow"
                      size="xs"
                      className={`bg-zinc-800/50 border-zinc-700/50 text-amber-400 font-bold px-3 py-3 rounded-lg ${!group.selected && "opacity-50 grayscale"}`}
                    >
                      Origen: {group.lote_correlativo}
                      {group.lote_serie_factura || group.lote_numero_factura
                        ? ` (${[group.lote_serie_factura, group.lote_numero_factura].filter(Boolean).join("-")})`
                        : ""}
                    </Badge>
                  )}
              </div>
            </div>
          </Group>

          {group.selected && !isActivoFijo && (
            <Button
              size="xs"
              variant="light"
              color="indigo"
              radius="xl"
              leftSection={<PlusIcon className="w-4 h-4" />}
              onClick={() => addLot(groupIndex)}
            >
              Dividir
            </Button>
          )}
        </div>
      </div>

      {group.selected && (
        <Stack gap={0} className="divide-y divide-zinc-800/50">
          {isActivoFijo ? (
            <div className="p-5">
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex items-center justify-between">
                <Group gap="sm">
                  <CheckCircleIcon className="w-6 h-6 text-indigo-400" />
                  <div>
                    <Text size="sm" fw={800} className="text-indigo-300">
                      Recepción de Activo Fijo (Transferencia)
                    </Text>
                    <Text size="xs" className="text-indigo-400/80">
                      Se registrará la recepción directa del activo fijo en la
                      ubicación destino.
                    </Text>
                  </div>
                </Group>
                <Badge
                  color="indigo"
                  variant="outline"
                  className="border-indigo-500/30"
                >
                  1 Unidad
                </Badge>
              </div>
            </div>
          ) : (
            group.lots.map((lot, lotIndex) => {
              const esNuevoLote = lot.es_nuevo_lote;

              return (
                <div
                  key={lotIndex}
                  className="p-5 space-y-4 relative group/lot animate-in fade-in duration-300"
                >
                  <Group justify="space-between">
                    <Text
                      size="xs"
                      fw={800}
                      c="zinc.5"
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
                  </Group>

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

                  {!esNuevoLote ? (
                    <div className="bg-zinc-950/20 p-3 rounded-xl border border-zinc-800/30 mb-2 space-y-3">
                      <LotesDisponiblesTable
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
                        maxQty={group.cantidad_transferida_base}
                        unidadBaseAbv={group.unidad_medida_base_abv}
                        detallesOrigen={[group]}
                      />
                    </div>
                  ) : (
                    <NuevoLoteTrans
                      groupIndex={groupIndex}
                      lotIndex={lotIndex}
                      lot={lot}
                      setLotValue={setLotValue}
                      getLotError={getLotError}
                      unidadBaseAbv={group.unidad_medida_base_abv}
                      unidadOCAbv={group.unidad_medida_oc_abv}
                      contenidoPorPresentacion={
                        group.contenido_por_presentacion_oc
                      }
                      maxPermitido={group.cantidad_transferida_base}
                    />
                  )}
                </div>
              );
            })
          )}
        </Stack>
      )}

      {group.selected && cantidadTotalError && (
        <Alert
          color="red"
          variant="light"
          icon={<CubeIcon className="w-4 h-4" />}
          m="md"
          radius="md"
          className="border border-red-500/20"
        >
          <Text size="xs" fw={700}>
            {cantidadTotalError}
          </Text>
        </Alert>
      )}
    </Paper>
  );
};
