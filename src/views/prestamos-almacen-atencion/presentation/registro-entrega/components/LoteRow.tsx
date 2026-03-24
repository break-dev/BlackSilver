import { NumberInput, Text, Group, Badge } from "@mantine/core";
import { formatNumber } from "../../../../../presentation/functions/formatNumber";
import type { RES_Lote_Atencion } from "../../service/prestamos-atencion.responses";

interface LoteRowProps {
  lote: RES_Lote_Atencion;
  idDetalle: number;
  entregaCantidades: Record<number, Record<number, number>>;
  handleCantLoteChange: (idDetalle: number, idLote: number, val: number) => void;
  unidadAbv: string;
  contenidoPorPresentacion: number;
}

export const LoteRow = ({
  lote,
  idDetalle,
  entregaCantidades,
  handleCantLoteChange,
  unidadAbv,
  contenidoPorPresentacion,
}: LoteRowProps) => {
  const currentValBase = entregaCantidades[idDetalle]?.[lote.id_lote] || 0;
  const currentValLote = currentValBase / (contenidoPorPresentacion || 1);

  return (
    <tr className="hover:bg-zinc-900/40 transition-all group">
      <td className="px-6 py-4">
        <Group gap="xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Text size="sm" fw={900} className="text-zinc-100 font-mono italic">{lote.correlativo}</Text>
        </Group>
      </td>
      <td className="px-6 py-4 text-center">
        <Badge variant="dot" color="indigo" size="sm" className="font-black px-3 py-3 rounded-lg bg-zinc-900/50">
          En Bodega: {formatNumber(lote.stock_actual)} {lote.presentacion_abv}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col items-center gap-1">
          <NumberInput
            variant="unstyled"
            value={currentValLote || ""}
            onChange={(val) => handleCantLoteChange(idDetalle, lote.id_lote, Number(val))}
            placeholder="0.00"
            min={0}
            decimalScale={3}
            hideControls
            size="md"
            className="w-28"
            classNames={{
              input: "text-center text-md font-black bg-zinc-900/80 text-emerald-400 rounded-xl border border-zinc-800 focus:border-emerald-500/50 transition-all placeholder:text-zinc-800 h-10"
            }}
          />
          <Text size="9px" fw={900} color="dimmed" className="uppercase tracking-[0.2em] opacity-40 font-mono">
             {unidadAbv}
          </Text>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
         <Text size="xs" fw={900} className={`font-mono transition-colors ${currentValBase > 0 ? 'text-emerald-500' : 'text-zinc-700'}`}>
            + {formatNumber(currentValBase)} <span className="text-[10px] opacity-50 font-black">BASE</span>
         </Text>
      </td>
    </tr>
  );
};
