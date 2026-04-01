import { Text, Select, NumberInput, Textarea, Group } from "@mantine/core";
import { formatNumber } from "../../../../../presentation/functions/formatNumber";
import { ScaleIcon, BeakerIcon } from "@heroicons/react/24/outline";
import { CustomDatePicker } from "../../../../../presentation/utils/date-picker-input";
import type { DTO_RecibirEntregaItem } from "../../../service/reabastecimiento.requests";
import type { RES_UnidadMedida } from "../../../../lotes-productos/service/lotes.responses";

interface NuevoLoteFormProps {
  groupIndex: number;
  lotIndex: number;
  lot: DTO_RecibirEntregaItem;
  setLotValue: <K extends keyof DTO_RecibirEntregaItem>(
    groupIndex: number,
    lotIndex: number,
    field: K,
    value: DTO_RecibirEntregaItem[K],
  ) => void;
  getLotError: (
    groupIndex: number,
    lotIndex: number,
    field: keyof DTO_RecibirEntregaItem,
  ) => string | null;
  unidades: RES_UnidadMedida[];
  loadingUnidades: boolean;
  unidadBaseAbv: string;
  esPerecible: boolean;
  isReadOnly?: boolean;
}

export const NuevoLoteForm = ({
  groupIndex,
  lotIndex,
  lot,
  setLotValue,
  getLotError,
  unidades,
  loadingUnidades,
  unidadBaseAbv,
  esPerecible,
}: NuevoLoteFormProps) => {
  const cantidad_base = Number(lot.cantidad_base) || 0;
  const maxPermitido = Number(lot.max_permitido) || 0; // Necesitamos pasar este valor o calcularlo

  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
    dropdown:
      "bg-zinc-950 border-zinc-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl",
    option:
      "text-zinc-300 hover:bg-zinc-800 hover:text-white data-[selected]:bg-indigo-600 data-[selected]:text-white font-medium transition-colors",
    label:
      "text-zinc-400 mb-0.5 font-bold text-[10px] uppercase tracking-wider",
    description: "text-indigo-400/80 text-[10px] font-bold mt-0.5",
  };

  const unidadSeleccionada = unidades.find(
    (u) => u.id_unidad_medida === lot.id_unidad_medida,
  );
  const unidadSeleccionadaAbv = unidadSeleccionada?.abreviatura || "...";
  const isBaseUnit = unidadSeleccionada?.abreviatura === unidadBaseAbv;

  const currentPresentaciones =
    !isBaseUnit &&
    lot.contenido_por_presentacion &&
    lot.contenido_por_presentacion > 0
      ? Number((cantidad_base / lot.contenido_por_presentacion).toFixed(3))
      : 1;

  return (
    <div className="flex flex-col gap-3">
      {/* Fila 1: Cantidad, Unidad, Contenido y Fecha Ingreso */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 shadow-sm bg-zinc-950/20 p-2 rounded-xl border border-zinc-800/30">
        <Select
          label="Unidad"
          placeholder="Unidad"
          data={unidades.map((u) => ({
            value: String(u.id_unidad_medida),
            label: `${u.nombre} (${u.abreviatura})`,
          }))}
          searchable
          withAsterisk
          disabled={loadingUnidades}
          value={lot.id_unidad_medida ? String(lot.id_unidad_medida) : null}
          onChange={(val) => {
            const selectedId = Number(val);
            const u = unidades.find((u) => u.id_unidad_medida === selectedId);
            setLotValue(groupIndex, lotIndex, "id_unidad_medida", selectedId);
            if (u?.abreviatura === unidadBaseAbv) {
              setLotValue(groupIndex, lotIndex, "contenido_por_presentacion", 1);
            } else {
              // Default to 1 unit of presentation (Ratio = Base Amount)
              setLotValue(
                groupIndex,
                lotIndex,
                "contenido_por_presentacion",
                Number(lot.cantidad_base) || 1,
              );
            }
          }}
          classNames={inputClasses}
          className="md:col-span-3"
          radius="md"
          size="xs"
          error={
            getLotError(groupIndex, lotIndex, "id_unidad_medida") || undefined
          }
        />
        {!isBaseUnit && (
          <NumberInput
            label={`Cant. ${unidadSeleccionadaAbv}`}
            placeholder="1"
            min={0}
            withAsterisk
            value={currentPresentaciones}
            onChange={(val) => {
              const numPresent = Number(val);
              if (numPresent > 0) {
                const newRatio = lot.cantidad_base / numPresent;
                setLotValue(
                  groupIndex,
                  lotIndex,
                  "contenido_por_presentacion",
                  newRatio,
                );
              }
            }}
            classNames={inputClasses}
            className="md:col-span-3"
            radius="md"
            size="xs"
            leftSection={<ScaleIcon className="w-3.5 h-3.5 text-indigo-400" />}
            error={
              getLotError(groupIndex, lotIndex, "contenido_por_presentacion") ||
              undefined
            }
          />
        )}
        <NumberInput
          label={`Cant. Recibir (${unidadBaseAbv})`}
          placeholder="0"
          min={0}
          max={maxPermitido > 0 ? maxPermitido : undefined}
          clampBehavior="strict"
          hideControls
          fixedDecimalScale
          withAsterisk
          value={lot.cantidad_base || ""}
          onChange={(val) => {
            setLotValue(groupIndex, lotIndex, "cantidad_base", Number(val));
          }}
          classNames={inputClasses}
          className="md:col-span-3"
          radius="md"
          size="xs"
          leftSection={<BeakerIcon className="w-3.5 h-3.5 text-emerald-500" />}
          error={getLotError(groupIndex, lotIndex, "cantidad_base") || undefined}
        />

        <CustomDatePicker
          label="Fecha Ingreso"
          placeholder="Hoy"
          withAsterisk
          size="xs"
          className="md:col-span-3"
          value={lot.fecha_ingreso ? new Date(lot.fecha_ingreso) : null}
          onChange={(date: Date | null | string) => {
            const validDate =
              date instanceof Date
                ? date
                : typeof date === "string"
                  ? new Date(date)
                  : null;
            setLotValue(
              groupIndex,
              lotIndex,
              "fecha_ingreso",
              validDate ? validDate.toISOString() : null,
            );
          }}
          error={
            getLotError(groupIndex, lotIndex, "fecha_ingreso") || undefined
          }
        />
      </div>

      {/* Fila 2: Vencimiento y Descripción */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
        {esPerecible && (
          <CustomDatePicker
            label="Vencimiento"
            placeholder="Expiración"
            withAsterisk
            size="xs"
            className="md:col-span-3"
            minDate={
              lot.fecha_ingreso ? new Date(lot.fecha_ingreso) : undefined
            }
            value={
              lot.fecha_vencimiento ? new Date(lot.fecha_vencimiento) : null
            }
            onChange={(date: Date | null | string) => {
              const validDate =
                date instanceof Date
                  ? date
                  : typeof date === "string"
                    ? new Date(date)
                    : null;
              setLotValue(
                groupIndex,
                lotIndex,
                "fecha_vencimiento",
                validDate ? validDate.toISOString() : null,
              );
            }}
            error={
              getLotError(groupIndex, lotIndex, "fecha_vencimiento") ||
              undefined
            }
          />
        )}

        <Textarea
          label="Descripción / Nota"
          placeholder="Especifique origen, estado, etc..."
          className={esPerecible ? "md:col-span-9" : "md:col-span-12"}
          value={lot.descripcion || ""}
          onChange={(e) =>
            setLotValue(
              groupIndex,
              lotIndex,
              "descripcion",
              e.currentTarget.value,
            )
          }
          classNames={inputClasses}
          radius="md"
          size="xs"
          minRows={1}
          autosize
        />
      </div>

      {!isBaseUnit &&
        lot.contenido_por_presentacion &&
        lot.contenido_por_presentacion > 0 && (
          <Group gap={6} px={4} mt={-2}>
            <Text
              size="xs"
              fw={700}
              c="dimmed"
              className="text-[10px] uppercase opacity-50 tracking-tighter"
            >
              Factor de Conversión:
            </Text>
            <Text size="xs" fw={900} className="text-white leading-none">
              {formatNumber(lot.contenido_por_presentacion)} {unidadBaseAbv} x{" "}
              {unidadSeleccionadaAbv}
            </Text>
          </Group>
        )}
    </div>
  );
};
