import React from "react";
import { Table, Text, Group, Radio, NumberInput } from "@mantine/core";
import dayjs from "dayjs";
import { formatNumber } from "../../../../../presentation/functions/formatNumber";
import type { RES_LoteRecepcion } from "../../../service/reabastecimiento.responses";

interface LotesDisponiblesTableProps {
  lotes: RES_LoteRecepcion[];
  loading: boolean;
  selectedAjustes: Record<number, number>;
  onUpdateTabular: (idLote: number, isActive: boolean, qty?: number) => void;
  unidadBaseAbv: string;
}

export const LotesDisponiblesTable = ({
  lotes,
  loading,
  selectedAjustes,
  onUpdateTabular,
  unidadBaseAbv,
}: LotesDisponiblesTableProps) => {
  return (
    <div className="overflow-hidden border border-zinc-800/60 rounded-xl bg-zinc-950/40 shadow-inner">
      <Table verticalSpacing="sm" horizontalSpacing="lg" className="border-collapse">
        <thead className="bg-zinc-900/60 text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-zinc-800/60 text-center">
          <tr>
            <th className="py-3 text-center">Lote</th>
            <th>Vencimiento</th>
            <th>Stock Actual</th>
            <th className="text-center">Recibir ({unidadBaseAbv})</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/40 relative">
          {loading ? (
            <tr>
              <td colSpan={4} className="py-14 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  <Text size="xs" fw={800} className="text-indigo-400 uppercase tracking-widest animate-pulse">
                    Leyendo Lotes de Almacén...
                  </Text>
                </div>
              </td>
            </tr>
          ) : lotes.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-10 text-center text-zinc-600 italic text-sm font-medium tracking-tight">
                No se encontraron lotes locales viables.
              </td>
            </tr>
          ) : (
            lotes.map((lote) => {
              const currentQty = selectedAjustes[lote.id_lote];
              const isActive = currentQty !== undefined;

              return (
                <tr key={lote.id_lote} className={`transition-all duration-200 ${isActive ? "bg-indigo-500/10 shadow-inner" : "hover:bg-zinc-800/30 font-light"}`}>
                  <td className="py-3 text-center">
                    <Text size="xs" fw={isActive ? 800 : 500} className="font-mono text-zinc-200">
                      {lote.correlativo}
                    </Text>
                  </td>
                  <td className="text-center">
                    {lote.fecha_vencimiento ? (
                      <Text size="xs" fw={700} c="zinc.4">
                        {dayjs(lote.fecha_vencimiento).format("DD/MM/YYYY")}
                      </Text>
                    ) : (
                      <Text size="xs" c="zinc.6" className="italic">N/A</Text>
                    )}
                  </td>
                  <td className="text-center">
                    <Group wrap="nowrap" justify="center" gap={3}>
                      <Text size="sm" fw={800} className="font-mono text-emerald-400">
                        {formatNumber(lote.stock_actual)}
                      </Text>
                      <Text size="10px" fw={800} c="zinc.5" className="uppercase tracking-widest pt-0.5">
                        {lote.unidad_medida_lote_abv}
                      </Text>
                    </Group>
                  </td>
                  <td className="text-center">
                    <Group gap="xs" justify="center" wrap="nowrap">
                      <Radio
                        checked={isActive}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateTabular(lote.id_lote, e.currentTarget.checked)}
                        color="indigo"
                        size="sm"
                        className="cursor-pointer"
                      />
                      <NumberInput
                        size="xs"
                        placeholder="0"
                        min={0}
                        hideControls
                        disabled={!isActive}
                        value={isActive ? currentQty : ""}
                        onChange={(val) => onUpdateTabular(lote.id_lote, true, Number(val))}
                        classNames={{
                          input: `w-20 bg-zinc-900 border-zinc-800 focus:border-indigo-500 text-right font-mono transition-opacity ${!isActive ? "opacity-30" : "opacity-100"}`,
                        }}
                      />
                    </Group>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
};
