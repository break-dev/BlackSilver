import { Table, Stack, Center, Loader, Text } from "@mantine/core";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";
import { LoteRow } from "./LoteRow";
import type { RES_Lote_Atencion } from "../../../service/prestamos-atencion.responses";

interface LotesTableProps {
  idDetalle: number;
  lotes: RES_Lote_Atencion[];
  loading: boolean;
  entregaCantidades: Record<number, Record<number, number>>;
  handleCantLoteChange: (idDetalle: number, idLote: number, val: number) => void;
  unidadAbv: string;
  baseAbv: string;
  contenidoPorPresentacion: number;
}

export const LotesTable = ({
  idDetalle,
  lotes,
  loading,
  entregaCantidades,
  handleCantLoteChange,
  unidadAbv,
  baseAbv,
  contenidoPorPresentacion,
}: LotesTableProps) => {
  if (loading) {
    return (
      <Center py={40}>
        <Stack gap="xs" align="center">
          <Loader size="md" color="indigo" />
          <Text size="xs" c="dimmed" className="uppercase tracking-widest animate-pulse font-black">Consultando existencias...</Text>
        </Stack>
      </Center>
    );
  }

  if (lotes.length === 0) {
    return (
      <Center py={40}>
        <Stack gap="sm" align="center" className="opacity-20">
          <ArchiveBoxIcon className="w-10 h-10 text-red-500" />
          <Text size="xs" fw={900} className="uppercase tracking-widest text-red-400">Sin stock disponible en almacén</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-zinc-800/40 shadow-2xl bg-zinc-950/60 transition-all">
      <Table verticalSpacing="md" horizontalSpacing="xl">
        <thead className="bg-zinc-900/50 text-zinc-500 text-[9px] uppercase font-black tracking-[0.2em] border-b border-zinc-800/30">
          <tr>
            <th className="px-6 py-4 text-left">Lote / Registro</th>
            <th className="px-6 py-4 text-center">Disponible</th>
            <th className="px-6 py-4 text-center">Cant. Despacho</th>
            <th className="px-6 py-4 text-center">Suma Base</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/10">
          {lotes.map((lote) => (
            <LoteRow
              key={lote.id_lote}
              lote={lote}
              idDetalle={idDetalle}
              entregaCantidades={entregaCantidades}
              handleCantLoteChange={handleCantLoteChange}
              unidadAbv={unidadAbv}
              baseAbv={baseAbv}
              contenidoPorPresentacion={contenidoPorPresentacion}
            />
          ))}
        </tbody>
      </Table>
    </div>
  );
};
