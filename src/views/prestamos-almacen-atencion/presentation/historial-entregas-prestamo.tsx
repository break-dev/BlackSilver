import { Paper, Group, Badge, Text, Stack } from "@mantine/core";
import dayjs from "dayjs";
import { type RES_EntregaPrestamo, type RES_DetalleEntregaPrestamo } from "../service/prestamos-atencion.responses";
import { formatNumber } from "../../../presentation/functions/formatNumber";

interface Props {
  entregas: RES_EntregaPrestamo[];
}

export const HistorialEntregasPrestamo = ({ entregas }: Props) => {
  if (entregas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/10 border-2 border-dashed border-zinc-800 rounded-3xl">
        <Text size="sm" c="zinc.5" fw={700} fs="italic">Sin movimientos registrados aún para este préstamo.</Text>
      </div>
    );
  }

  return (
    <Stack gap="lg" className="px-1">
      {entregas.map((e) => (
        <Paper key={e.id_entrega} p="xl" radius="2xl" className="bg-zinc-900/40 border border-zinc-800/60 shadow-xl backdrop-blur-md overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
          
          <Group justify="space-between" mb="md" align="start">
            <Stack gap={2}>
              <Badge variant="filled" color="indigo" radius="sm" className="font-mono font-black tracking-widest text-sm shadow-md">{e.correlativo}</Badge>
              <Text size="10px" c="dimmed" fw={900} className="uppercase tracking-[0.2em] opacity-40 ml-1">Fecha de Entrega: {dayjs(e.fecha_hora_entrega).format("DD/MM/YYYY HH:mm")}</Text>
            </Stack>
            <Badge variant="dot" size="sm" color="emerald" className="font-black uppercase tracking-widest">{e.estado}</Badge>
          </Group>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 border-y border-zinc-800/30 py-4">
             <Group gap="sm" wrap="nowrap">
                <div className="p-2 bg-zinc-800/50 rounded-xl"><Text size="xs" fw={900} c="indigo.4">EN:</Text></div>
                <Stack gap={0}>
                  <Text size="9px" fw={900} c="zinc.6" className="uppercase tracking-widest">Entregado por:</Text>
                  <Text size="sm" fw={800} c="white" className="italic">{e.empleado_entrega}</Text>
                </Stack>
             </Group>
             <Group gap="sm" wrap="nowrap">
                <div className="p-2 bg-zinc-800/50 rounded-xl"><Text size="xs" fw={900} c="emerald.4">RC:</Text></div>
                <Stack gap={0}>
                   <Text size="9px" fw={900} c="zinc.6" className="uppercase tracking-widest">Recibido por:</Text>
                   <Text size="sm" fw={800} c="white" fs="italic">{e.empleado_recibe}</Text>
                </Stack>
             </Group>
          </div>

          <div className="space-y-2">
            <Text size="xs" fw={900} c="zinc.5" className="uppercase tracking-[0.2em] mb-3 border-l-2 border-indigo-500 pl-3">Detalle del Movimiento</Text>
            <div className="overflow-hidden rounded-xl border border-zinc-800/40 bg-zinc-950/20">
                <table className="w-full text-[11px] text-zinc-300">
                    <thead className="bg-zinc-900/50 text-zinc-500 uppercase font-black">
                        <tr>
                            <th className="px-4 py-2 text-left">Producto / Lote</th>
                            <th className="px-4 py-2 text-right">Cantidad</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/20">
                        {e.detalles?.map((det: RES_DetalleEntregaPrestamo) => (
                            <tr key={det.id_entrega_detalle} className="hover:bg-zinc-800/20 transition-colors">
                                <td className="px-4 py-3">
                                    <Stack gap={0}>
                                        <Text size="xs" fw={800}>{det.producto}</Text>
                                        <Text size="9px" fw={700} color="indigo.4" className="uppercase tracking-widest font-mono">Lote: {det.correlativo_lote}</Text>
                                    </Stack>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Badge variant="light" color="cyan" radius="sm" className="font-mono font-black">{formatNumber(det.cantidad)} {det.unidad_medida_abv}</Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>

          {e.observacion && (
            <Paper p="md" radius="lg" mt="md" className="bg-zinc-800/20 border-l-4 border-zinc-700" fs="italic">
               <Text size="xs" c="zinc.4" className="leading-relaxed">"{e.observacion}"</Text>
            </Paper>
          )}
        </Paper>
      ))}
    </Stack>
  );
};
