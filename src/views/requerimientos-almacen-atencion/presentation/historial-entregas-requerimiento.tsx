import {
  Loader,
  Stack,
  Table,
  Text,
  Badge,
} from "@mantine/core";
import dayjs from "dayjs";
import { useHistorialEntregasRequerimiento } from "../hooks/useHistorialEntregasRequerimiento";

interface HistorialProps {
  idRequerimiento: number;
}

export const HistorialEntregasRequerimiento = ({ idRequerimiento }: HistorialProps) => {
  const { loading, historial, error } = useHistorialEntregasRequerimiento(idRequerimiento);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );

  if (error) return <Text c="red" ta="center">{error}</Text>;

  if (historial.length === 0)
    return (
      <div className="py-12 text-center">
        <Text c="zinc.5">No registra entregas previas para este requerimiento.</Text>
      </div>
    );

  return (
    <Stack gap="lg" className="font-sans">
      <div className="space-y-4">
        <div className="overflow-hidden border border-zinc-800 rounded-2xl bg-zinc-950/20 shadow-sm max-h-[60vh] overflow-y-auto">
          <Table verticalSpacing="md" horizontalSpacing="xl" className="border-collapse">
            <thead className="bg-zinc-900/80 text-zinc-400 text-xs font-bold border-b border-zinc-800 sticky top-0 z-10">
              <tr>
                <th className="py-4 pl-8" style={{ width: "15%" }}>Cod. Entrega</th>
                <th className="text-left" style={{ width: "15%" }}>Fecha</th>
                <th className="text-left" style={{ width: "20%" }}>Entregado a</th>
                <th className="text-left" style={{ width: "50%" }}>Productos Entregados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/20">
              {historial.map((h) => (
                <tr key={h.id_requerimiento_almacen_entrega} className="text-zinc-400 hover:bg-zinc-900/40 transition-all group align-top">
                  <td className="py-4 pl-8">
                    <Badge variant="light" color="violet" radius="sm" size="sm" className="font-black">
                      {h.correlativo}
                    </Badge>
                  </td>
                  <td className="text-left py-4">
                    <div className="flex flex-col">
                      <Text size="sm" fw={700} className="text-zinc-300">
                        {dayjs(h.fecha_hora_entrega * 1000).format("DD/MM/YYYY")}
                      </Text>
                      <Text size="xs" fw={600} c="zinc.6" className="uppercase">
                        {dayjs(h.fecha_hora_entrega * 1000).format("HH:mm A")}
                      </Text>
                    </div>
                  </td>
                  <td className="py-4">
                    <Text size="sm" fw={700} className="text-zinc-300">
                      {h.empleado_recibe}
                    </Text>
                    <Text size="xs" c="zinc.5" mt={4} className="italic max-w-xs truncate" title={h.observacion || ""}>
                      {h.observacion || "Sin observaciones"}
                    </Text>
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col gap-2">
                       {h.detalles && h.detalles.length > 0 ? h.detalles.map((d) => (
                          <div key={d.id_entrega_detalle} className="flex justify-between items-center bg-zinc-900/30 p-2 rounded-md border border-zinc-800/50">
                             <div className="flex flex-col">
                                <Text size="xs" fw={800} c="zinc.3">{d.producto}</Text>
                                <Text size="9px" fw={700} c="zinc.5">Lote: {d.correlativo}</Text>
                             </div>
                             <div className="text-right flex items-center gap-1">
                                <Text size="sm" fw={900} className="text-emerald-500 font-mono leading-none">
                                  +{Number(d.cantidad_base).toFixed(2)}
                                </Text>
                                <Text size="9px" fw={800} c="zinc.6" className="uppercase">
                                  {d.unidad_lote_abv || "UNI"}
                                </Text>
                             </div>
                          </div>
                       )) : (
                         <Text size="xs" c="zinc.6">Sin detalles</Text>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </Stack>
  );
};
