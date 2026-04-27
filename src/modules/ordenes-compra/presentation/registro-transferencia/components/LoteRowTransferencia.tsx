import { NumberInput, Text, Badge, Stack, Group } from "@mantine/core";
import dayjs from "dayjs";
import { formatNumber } from "../../../../../shared/functions/formatNumber";
import type { RES_LoteDisponible } from "../../../../../service/responses/lote-producto";
import type { RES_OrdenCompraRecepcionDetalle } from "../../../../../service/responses/ordenes-compra/orden-compra-recepcion";

interface LoteRowProps {
  lote: RES_LoteDisponible;
  idDetalle: number;
  detalle: RES_OrdenCompraRecepcionDetalle;
  transferenciaCantidades: Record<number, Record<number, number>>;
  handleCantLoteChange: (
    idDetalle: number,
    idLote: number,
    val: number,
  ) => void;
  unidadAbv: string;
  baseAbv: string;
  contenidoPorPresentacion: number;
  cantidadMaximaTransferirBase: number;
}

export const LoteRowTransferencia = ({
  lote,
  idDetalle,
  transferenciaCantidades,
  handleCantLoteChange,
  unidadAbv,
  baseAbv,
  contenidoPorPresentacion,
  cantidadMaximaTransferirBase,
}: LoteRowProps) => {
  const currentValBase =
    transferenciaCantidades[idDetalle]?.[lote.id_lote] || 0;
  const currentValLote = currentValBase / (contenidoPorPresentacion || 1);

  // Cantidad total asignada a este lote en TODOS los detalles
  const totalAsignadoGlobal = Object.entries(transferenciaCantidades).reduce(
    (sum, [, lotesMap]) => sum + (lotesMap[lote.id_lote] || 0),
    0,
  );

  const stockRestanteGlobal = Math.max(
    0,
    lote.stock_actual_base - totalAsignadoGlobal,
  );

  // Cantidad asignada en OTROS lotes para este mismo detalle (para limitar el pendiente)
  const totalDespachadoOtrosLotes = Object.entries(
    transferenciaCantidades[idDetalle] || {},
  )
    .filter(([idLote]) => Number(idLote) !== lote.id_lote)
    .reduce((sum, [, val]) => sum + (val || 0), 0);

  // Cantidad asignada en OTROS detalles para este mismo lote (para limitar el stock físico)
  const totalEnOtrosDetalles = totalAsignadoGlobal - currentValBase;
  const stockDisponibleParaEsteDetalle =
    lote.stock_actual_base - totalEnOtrosDetalles;

  // No podemos transferir más de lo recepcionado
  const maxAsignableBase = Math.max(
    0,
    Math.min(
      stockDisponibleParaEsteDetalle,
      cantidadMaximaTransferirBase - totalDespachadoOtrosLotes,
    ),
  );
  const maxAsignableLote = maxAsignableBase / (contenidoPorPresentacion || 1);

  const hasConversion = unidadAbv !== baseAbv;

  const esCritico =
    lote.dias_para_vencer !== null && lote.dias_para_vencer <= 30;
  const esVencido = lote.dias_para_vencer !== null && lote.dias_para_vencer < 0;

  return (
    <tr
      className={`${currentValBase > 0 ? "bg-indigo-500/5" : "hover:bg-zinc-800/20"} transition-colors`}
    >
      <td className="py-3 text-center px-4">
        <Badge
          variant="light"
          color="indigo"
          radius="sm"
          className="font-bold border border-indigo-500/20 py-3"
        >
          {lote.correlativo}
        </Badge>
      </td>
      <td className="text-center px-4">
        {lote.fecha_vencimiento ? (
          <div className="flex flex-col gap-1 items-center">
            <Text size="xs" fw={800} className="text-zinc-300 font-mono">
              {dayjs(lote.fecha_vencimiento).format("DD MMM YYYY")}
            </Text>
            <Badge
              variant="dot"
              color={esVencido ? "red" : esCritico ? "orange" : "teal"}
              size="xs"
              className="font-bold py-1.5"
            >
              {esVencido ? "CADUCADO" : `${lote.dias_para_vencer} DÍAS`}
            </Badge>
          </div>
        ) : (
          <Text size="10px" fw={700} className="italic text-zinc-500!">
            SIN VENCIMIENTO
          </Text>
        )}
      </td>
      <td className="text-center px-4">
        <Stack align="center" gap={10}>
          <Group gap={4} wrap="nowrap" justify="center">
            <Badge
              variant="light"
              color="zinc.4"
              className="bg-zinc-800/30 font-black h-7"
            >
              {formatNumber(stockRestanteGlobal)} {baseAbv}
            </Badge>
            {hasConversion && (
              <Badge
                variant="light"
                color="indigo.4"
                className="bg-zinc-800/30 font-black h-7"
              >
                {formatNumber(lote.stock_actual)} {lote.unidad_medida_lote_abv}
              </Badge>
            )}
          </Group>

          {hasConversion && (
            <Text
              size="9px"
              c="zinc.5"
              fw={700}
              className="italic uppercase tracking-tight"
            >
              {formatNumber(contenidoPorPresentacion)} {baseAbv} x {unidadAbv}
            </Text>
          )}
        </Stack>
      </td>
      <td className="py-2 px-4">
        <div className="flex items-center justify-center gap-3">
          {hasConversion && (
            <NumberInput
              size="sm"
              radius="xl"
              min={0}
              max={maxAsignableLote}
              value={currentValLote || ""}
              onChange={(val) =>
                handleCantLoteChange(
                  idDetalle,
                  lote.id_lote,
                  Number(val) * (contenidoPorPresentacion || 1),
                )
              }
              placeholder="0"
              decimalScale={4}
              clampBehavior="strict"
              hideControls
              rightSection={
                <Text size="xs" fw={900} c="zinc.5" className="mr-3 lowercase">
                  {unidadAbv}
                </Text>
              }
              rightSectionWidth={60}
              className="w-32"
              classNames={{
                input: `bg-zinc-950/50 border-zinc-800 focus:border-indigo-500/50 font-black text-sm h-10 shadow-inner ${currentValBase > 0 ? "text-indigo-400 ring-1 ring-indigo-500/20" : "text-white"} text-right pr-12`,
              }}
            />
          )}

          <div className="relative">
            <NumberInput
              size="sm"
              radius="xl"
              min={0}
              max={maxAsignableBase}
              value={currentValBase || ""}
              onChange={(val) => {
                handleCantLoteChange(idDetalle, lote.id_lote, Number(val));
              }}
              placeholder="0"
              decimalScale={4}
              clampBehavior="strict"
              hideControls
              rightSection={
                <Text size="xs" fw={900} c="zinc.5" className="mr-3 lowercase">
                  {baseAbv}
                </Text>
              }
              rightSectionWidth={60}
              className="w-32"
              classNames={{
                input: `bg-zinc-950/50 border-zinc-800 focus:border-indigo-500/50 font-black text-sm h-10 shadow-inner ${currentValBase > 0 ? "text-indigo-400 ring-1 ring-indigo-500/20" : "text-white"} text-right pr-12`,
              }}
            />
          </div>
        </div>
      </td>
    </tr>
  );
};
