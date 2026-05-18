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
  TextInput,
  Select,
  NumberInput,
  Textarea,
  Loader,
} from "@mantine/core";
import { PlusIcon, TrashIcon, CubeIcon } from "@heroicons/react/24/outline";
import { formatNumber } from "../../../../../shared/functions/formatNumber";
import type {
  GroupedReceptionOC,
  DTO_RecepcionLotExtendido,
} from "../../../hooks/registro-recepcion/useRegistroRecepcionOC";
import type { RES_LoteDisponible } from "../../../../../service/responses/lote-producto";
import { LotesDisponiblesTableOC } from "./LotesDisponiblesTableOC";
import { NuevoLoteFormOC } from "./NuevoLoteFormOC";
import { TipoBien } from "../../../../../shared/enums/_generic/tipo-bien";
import type { RES_Marca } from "../../../../../service/responses/marca";

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
    label: "text-zinc-400 mb-1 font-semibold text-[11px] uppercase tracking-wider",
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
                  Para: {group.almacen_recepcionista}
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
              {group.lots.map((lot, lotIndex) => {
                const codigoError = getLotError(groupIndex, lotIndex, "codigo");

                return (
                  <div
                    key={lotIndex}
                    className="p-5 space-y-4 relative group/lot bg-zinc-900/10 border-b border-zinc-800/40"
                  >
                    {lotIndex > 0 && (
                      <Divider color="zinc.8" variant="dashed" mb="md" />
                    )}

                    <div className="flex justify-between items-center mb-2">
                      <Group gap="xs">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <Text
                          size="xs"
                          fw={900}
                          className="text-indigo-400 uppercase tracking-widest"
                        >
                          Unidad de Activo #{lotIndex + 1}
                        </Text>
                      </Group>
                      {group.lots.length > 1 && (
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          radius="md"
                          onClick={() => removeLot(groupIndex, lotIndex)}
                          title="Eliminar Unidad de Activo"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </ActionIcon>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextInput
                        label="Código Interno"
                        placeholder="Ej. ACT-001"
                        value={lot.codigo || ""}
                        onChange={(e) =>
                          setLotValue(
                            groupIndex,
                            lotIndex,
                            "codigo",
                            e.currentTarget.value,
                          )
                        }
                        error={codigoError}
                        size="xs"
                        radius="lg"
                        classNames={inputClasses}
                      />

                      <TextInput
                        label="Número de Serie"
                        placeholder="Ej. S/N 123456"
                        value={lot.numero_serie || ""}
                        onChange={(e) =>
                          setLotValue(
                            groupIndex,
                            lotIndex,
                            "numero_serie",
                            e.currentTarget.value,
                          )
                        }
                        size="xs"
                        radius="lg"
                        classNames={inputClasses}
                      />

                      <Select
                        label="Marca"
                        placeholder="Seleccione Marca"
                        data={marcas.map((m) => ({
                          value: m.id_marca.toString(),
                          label: m.nombre,
                        }))}
                        value={lot.id_marca?.toString() || null}
                        onChange={(val) =>
                          setLotValue(
                            groupIndex,
                            lotIndex,
                            "id_marca",
                            val ? Number(val) : null,
                          )
                        }
                        searchable
                        clearable
                        comboboxProps={{ withinPortal: true }}
                        size="xs"
                        radius="lg"
                        classNames={inputClasses}
                        rightSection={
                          loadingMarcas ? (
                            <Loader size={12} color="indigo" />
                          ) : null
                        }
                      />

                      <TextInput
                        label="Modelo"
                        placeholder="Ej. Caterpillar 994K"
                        value={lot.modelo || ""}
                        onChange={(e) =>
                          setLotValue(
                            groupIndex,
                            lotIndex,
                            "modelo",
                            e.currentTarget.value,
                          )
                        }
                        size="xs"
                        radius="lg"
                        classNames={inputClasses}
                      />

                      <NumberInput
                        label="Año del Modelo"
                        placeholder="Ej. 2026"
                        value={lot.yearcito_modelo || undefined}
                        onChange={(val) =>
                          setLotValue(
                            groupIndex,
                            lotIndex,
                            "yearcito_modelo",
                            val ? Number(val) : null,
                          )
                        }
                        hideControls
                        size="xs"
                        radius="lg"
                        classNames={inputClasses}
                      />

                      <Textarea
                        label="Descripción / Notas"
                        placeholder="Especificaciones o notas adicionales..."
                        value={lot.descripcion_activo || ""}
                        onChange={(e) =>
                          setLotValue(
                            groupIndex,
                            lotIndex,
                            "descripcion_activo",
                            e.currentTarget.value,
                          )
                        }
                        autosize
                        minRows={1}
                        size="xs"
                        radius="lg"
                        classNames={inputClasses}
                      />
                    </div>
                  </div>
                );
              })}

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
            group.lots.map((lot, lotIndex) => {
              const esNuevoLote = lot.es_nuevo_lote;

              return (
                <div
                  key={lotIndex}
                  className="p-5 space-y-4 relative group/lot"
                >
                  {lotIndex > 0 && (
                    <Divider color="zinc.8" variant="dashed" mb="md" />
                  )}
                  <div className="flex justify-between items-center mb-2">
                    <Text size="xs" fw={800} c="dimmed" className="uppercase">
                      Partición #{lotIndex + 1}
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
                        Ajustar Stock
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
                        Nuevo Lote
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
            })
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
