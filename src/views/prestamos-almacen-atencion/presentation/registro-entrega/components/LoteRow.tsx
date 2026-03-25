import { NumberInput, Text, Badge } from "@mantine/core";
import { formatNumber } from "../../../../../presentation/functions/formatNumber";
import type { RES_Lote_Atencion } from "../../../service/prestamos-atencion.responses";

interface LoteRowProps {
  lote: RES_Lote_Atencion;
  idDetalle: number;
  entregaCantidades: Record<number, Record<number, number>>;
  handleCantLoteChange: (idDetalle: number, idLote: number, val: number) => void;
  unidadAbv: string;
  baseAbv: string;
  contenidoPorPresentacion: number;
}

export const LoteRow = ({
  lote,
  idDetalle,
  entregaCantidades,
  handleCantLoteChange,
  unidadAbv,
  baseAbv,
  contenidoPorPresentacion,
}: LoteRowProps) => {
  const currentValBase = entregaCantidades[idDetalle]?.[lote.id_lote] || 0;
  const currentValLote = currentValBase / (contenidoPorPresentacion || 1);

  const hasConversion = unidadAbv !== baseAbv;

  return (
    <tr className={`${currentValBase > 0 ? "bg-indigo-500/5" : "hover:bg-zinc-800/20"} transition-colors`}>
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
        <Badge
          variant="light"
          color="zinc.4"
          className="bg-zinc-800/30 font-black h-7"
        >
          {formatNumber(lote.stock_actual)} {lote.presentacion_abv}
        </Badge>
      </td>
      <td className="py-2 px-4">
        <div className="flex items-center justify-center gap-3">
          {hasConversion && (
            <NumberInput
              size="sm"
              radius="xl"
              min={0}
              value={currentValLote || ""}
              onChange={(val) => handleCantLoteChange(idDetalle, lote.id_lote, Number(val))}
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
              // Si no hay conversión, el handle lo hace el hook via valLote (que multiplicamos por 1)
              // Pero en el hook manejamos valLote. Si no hay conversión, valLote = valBase.
              value={currentValBase || ""}
              onChange={(val) => {
                const factor = hasConversion ? (contenidoPorPresentacion || 1) : 1;
                handleCantLoteChange(idDetalle, lote.id_lote, Number(val) / factor);
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
            {!hasConversion && (
                <div className="absolute -top-4 left-0 w-full text-center">
                   <Text size="8px" fw={900} c="indigo.4" className="uppercase tracking-tighter opacity-50">Base</Text>
                </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
          <Text size="xs" fw={900} className={`font-mono transition-colors ${currentValBase > 0 ? 'text-indigo-400' : 'text-zinc-700'}`}>
             + {formatNumber(currentValBase)} <span className="text-[10px] opacity-30 font-black uppercase tracking-tighter">{baseAbv}</span>
          </Text>
      </td>
    </tr>
  );
};
