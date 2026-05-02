import React from "react";
import { Text, NumberInput, Textarea, Group, Badge } from "@mantine/core";
import { ScaleIcon, BeakerIcon } from "@heroicons/react/24/outline";
import { CustomDatePicker } from "../../../../presentation/utils/date-picker-input";
import type { DTO_LoteRecepcionTrans } from "../../hooks/useRegistrarRecepcion";
import { formatNumber } from "../../../../shared/functions/formatNumber";

interface Props {
  groupIndex: number;
  lotIndex: number;
  lot: DTO_LoteRecepcionTrans;
  setLotValue: <K extends keyof DTO_LoteRecepcionTrans>(
    groupIndex: number,
    lotIndex: number,
    field: K,
    value: DTO_LoteRecepcionTrans[K],
  ) => void;
  getLotError: (
    groupIndex: number,
    lotIndex: number,
    field: keyof DTO_LoteRecepcionTrans,
  ) => string | null;
  unidadBaseAbv: string;
  unidadOCAbv: string;
  contenidoPorPresentacion: number;
  maxPermitido?: number;
}

const inputClasses = {
  input:
    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
  label: "text-zinc-400 mb-0.5 font-bold text-[10px] uppercase tracking-wider",
  description: "text-indigo-400/80 text-[10px] font-bold mt-0.5",
};

export const NuevoLoteFormOCTrans = ({
  groupIndex,
  lotIndex,
  lot,
  setLotValue,
  getLotError,
  unidadBaseAbv,
  unidadOCAbv,
  contenidoPorPresentacion,
  maxPermitido,
}: Props) => {
  const cantidad_base = Number(lot.cantidad_base) || 0;
  const isBaseUnit = unidadOCAbv === unidadBaseAbv;

  const cantOC =
    contenidoPorPresentacion > 0
      ? Number((cantidad_base / contenidoPorPresentacion).toFixed(3))
      : 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 shadow-sm bg-zinc-950/20 p-2 rounded-xl border border-zinc-800/30">
        <div className="md:col-span-2 flex flex-col justify-center">
          <Text
            size="10px"
            fw={900}
            c="dimmed"
            className="uppercase tracking-widest mb-0.5 ml-0.5"
          >
            Unidad OC
          </Text>
          <Badge
            variant="filled"
            color="indigo"
            radius="md"
            size="md"
            className="w-full h-[36px]"
          >
            {unidadOCAbv}
          </Badge>
        </div>

        {!isBaseUnit && (
          <NumberInput
            label={`Cant. ${unidadOCAbv}`}
            placeholder="1"
            min={0}
            value={cantOC}
            onChange={(val: string | number) => {
              const numVal = Number(val);
              if (numVal >= 0) {
                setLotValue(
                  groupIndex,
                  lotIndex,
                  "cantidad_base",
                  numVal * contenidoPorPresentacion,
                );
              }
            }}
            className="md:col-span-2"
            classNames={inputClasses}
            radius="md"
            size="xs"
            leftSection={<ScaleIcon className="w-3.5 h-3.5 text-indigo-400" />}
          />
        )}

        <NumberInput
          label={`Cant. Recibir (${unidadBaseAbv})`}
          placeholder="0"
          min={0}
          max={maxPermitido}
          clampBehavior="strict"
          hideControls
          fixedDecimalScale
          value={lot.cantidad_base || ""}
          onChange={(val: string | number) => {
            setLotValue(groupIndex, lotIndex, "cantidad_base", Number(val));
          }}
          className={isBaseUnit ? "md:col-span-6" : "md:col-span-4"}
          classNames={inputClasses}
          radius="md"
          size="xs"
          leftSection={<BeakerIcon className="w-3.5 h-3.5 text-emerald-500" />}
          error={
            getLotError(groupIndex, lotIndex, "cantidad_base") || undefined
          }
        />

        <CustomDatePicker
          label="Fecha Ingreso"
          placeholder="Hoy"
          size="xs"
          className="md:col-span-4"
          classNames={inputClasses}
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
        <CustomDatePicker
          label="Vencimiento (opcional)"
          placeholder="Sin fecha"
          size="xs"
          className="md:col-span-4"
          classNames={inputClasses}
          minDate={lot.fecha_ingreso ? new Date(lot.fecha_ingreso) : undefined}
          value={lot.fecha_vencimiento ? new Date(lot.fecha_vencimiento) : null}
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
        />

        <Textarea
          label="Descripción / Nota"
          placeholder="Especifique origen, estado, etc..."
          className="md:col-span-8"
          value={lot.descripcion || ""}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
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

      {!isBaseUnit && (
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
            {formatNumber(contenidoPorPresentacion)} {unidadBaseAbv} x{" "}
            {unidadOCAbv}
          </Text>
        </Group>
      )}
    </div>
  );
};
