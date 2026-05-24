import {
  Group,
  Paper,
  Stack,
  Text,
  Badge,
  Button,
  Checkbox,
  Alert,
} from "@mantine/core";
import { PlusIcon, CubeIcon } from "@heroicons/react/24/outline";
import { formatNumber } from "../../../../../shared/functions/formatNumber";
import type {
  GroupedReceptionOC,
  DTO_RecepcionLotExtendido,
} from "../../../hooks/registro-recepcion/useRegistroRecepcionOC";
import type { RES_LoteDisponible } from "../../../../../service/responses/lote-producto";
import { TipoBien } from "../../../../../shared/enums/_generic/tipo-bien";
import type { RES_Marca } from "../../../../../service/responses/marca";
import { ActivoRecepcionRowOC } from "./ActivoRecepcionRowOC";
import { LoteRecepcionRowOC } from "./LoteRecepcionRowOC";

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
  marcas: RES_Marca[];
  loadingMarcas: boolean;
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
  marcas,
  loadingMarcas,
}: Props) => {
  const isActivoFijo = group.tipo_bien === TipoBien.ActivoFijo;

  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    dropdown:
      "bg-zinc-950 border-zinc-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl",
    option:
      "text-zinc-300 hover:bg-zinc-800 hover:text-white data-[selected]:bg-indigo-600 data-[selected]:text-white font-medium transition-colors",
    label:
      "text-zinc-400 mb-1 font-semibold text-[11px] uppercase tracking-wider",
  };
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
              size="sm"
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
                className={`w-4 h-4 ${
                  group.selected ? "text-indigo-400" : "text-zinc-500"
                }`}
              />
            </div>
            <div>
              <Text
                size="sm"
                fw={800}
                className={`${
                  group.selected ? "text-white" : "text-zinc-400"
                } tracking-tight leading-tight`}
              >
                {group.producto}
              </Text>
              <Group gap="xs" mt={4}>
                <Badge
                  variant="dot"
                  color={group.selected ? "indigo" : "gray"}
                  size="xs"
                  className={`${
                    group.selected
                      ? "bg-zinc-800/50 border-zinc-700/50 text-indigo-400"
                      : "bg-zinc-900/50 border-zinc-800/50 text-zinc-500"
                  } font-bold px-3 py-3 rounded-lg`}
                >
                  {group.id_mina_destino != null
                    ? `Para Mina: ${group.mina_destino || "Desconocida"}`
                    : `Para Almacén: ${group.almacen_recepcionista}`}
                </Badge>
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

          {group.selected && !isActivoFijo && (
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
          {isActivoFijo ? (
            <div className="space-y-4">
              {group.lots.map((lot, lotIndex) => (
                <ActivoRecepcionRowOC
                  key={lotIndex}
                  lot={lot}
                  lotIndex={lotIndex}
                  groupIndex={groupIndex}
                  totalLots={group.lots.length}
                  codigoError={
                    getLotError(groupIndex, lotIndex, "codigo") || undefined
                  }
                  marcas={marcas}
                  loadingMarcas={loadingMarcas}
                  setLotValue={setLotValue}
                  removeLot={removeLot}
                  inputClasses={inputClasses}
                />
              ))}

              {group.lots.length < group.cantidad_requerida_base && (
                <div className="p-5 pt-2">
                  <Button
                    size="xs"
                    variant="light"
                    color="indigo"
                    radius="lg"
                    fullWidth
                    leftSection={<PlusIcon className="w-4 h-4" />}
                    onClick={() => addLot(groupIndex)}
                    className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider"
                  >
                    Añadir Unidad de Activo ({group.lots.length} de{" "}
                    {formatNumber(group.cantidad_requerida_base)} Registrados)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            group.lots.map((lot, lotIndex) => (
              <LoteRecepcionRowOC
                key={lotIndex}
                lot={lot}
                lotIndex={lotIndex}
                groupIndex={groupIndex}
                group={group}
                productLots={productLots}
                loadingLotes={loadingLotes}
                getLotError={getLotError}
                setLotValue={setLotValue}
                removeLot={removeLot}
                updateTabularAdjustment={updateTabularAdjustment}
              />
            ))
          )}
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
