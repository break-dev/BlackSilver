import {
  Loader,
  Stack,
  Text,
  Badge,
  Paper,
  Group,
  Timeline,
} from "@mantine/core";
import dayjs from "dayjs";
import { useTrazabilidadDetalle } from "../hooks/useTrazabilidadDetalle";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface TrazabilidadProps {
  idDetalle: number;
  productoNombre: string;
}

export const TrazabilidadDetalle = ({
  idDetalle,
  productoNombre,
}: TrazabilidadProps) => {
  const { loading, eventos } = useTrazabilidadDetalle(idDetalle);

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Loader size="sm" />
      </div>
    );

  return (
    <Stack gap="lg" className="px-2 pb-4">
      <Paper
        p="md"
        radius="lg"
        className="bg-zinc-900/50 border border-zinc-800 shadow-sm overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 -mr-8 -mt-8 rounded-full blur-2xl" />
        <Stack gap={4}>
          <Text
            size="xs"
            c="zinc.5"
            fw={800}
            className="uppercase tracking-widest leading-none"
          >
            Producto
          </Text>
          <Text size="md" fw={900} className="text-white leading-tight">
            {productoNombre}
          </Text>
        </Stack>
      </Paper>

      {eventos.length === 0 ? (
        <div className="py-10 text-center flex flex-col items-center gap-3">
          <ClockIcon className="w-8 h-8 text-zinc-700" />
          <Text c="zinc.6" size="sm" fs="italic">
            No hay eventos registrados para este producto.
          </Text>
        </div>
      ) : (
        <Timeline
          active={eventos.length - 1}
          bulletSize={32}
          lineWidth={2}
          color="indigo"
          classNames={{
            itemBullet: "bg-zinc-900 border-2 border-zinc-800",
            itemContent: "pb-8",
          }}
        >
          {eventos.map((e, index) => {
            let Icon = ClockIcon;
            let iconColor = "text-zinc-500";
            let bulletColor = "zinc";

            const estadoUpper = e.estado.toUpperCase();
            if (
              estadoUpper.includes("GENERADA") ||
              estadoUpper.includes("CREADO")
            ) {
              Icon = PlusIcon;
              iconColor = "text-blue-400";
              bulletColor = "blue";
            }
            if (estadoUpper.includes("APROBADO")) {
              Icon = CheckCircleIcon;
              iconColor = "text-emerald-400";
              bulletColor = "emerald";
            }
            if (estadoUpper.includes("RECHAZADO")) {
              Icon = XCircleIcon;
              iconColor = "text-red-400";
              bulletColor = "red";
            }
            if (
              estadoUpper.includes("ENTREGA") ||
              estadoUpper.includes("DESPACHO")
            ) {
              Icon = TruckIcon;
              iconColor = "text-amber-400";
              bulletColor = "amber";
            }

            return (
              <Timeline.Item
                key={index}
                bullet={<Icon className={`w-5 h-5 ${iconColor}`} />}
              >
                <Paper
                  p="md"
                  radius="xl"
                  className="bg-zinc-950/40 border border-zinc-800/60 shadow-sm ml-2 hover:bg-zinc-900/40 transition-colors"
                >
                  <Group justify="space-between" mb={4}>
                    <Badge
                      color={bulletColor}
                      variant="light"
                      size="sm"
                      className="font-bold uppercase tracking-wider"
                    >
                      {e.estado}
                    </Badge>
                    <Text
                      size="10px"
                      fw={700}
                      className="text-zinc-500 font-mono italic"
                    >
                      {dayjs(e.created_at).format("DD/MM/YYYY HH:mm A")}
                    </Text>
                  </Group>
                  <Stack gap={4}>
                    <Text size="sm" className="text-zinc-200 leading-relaxed">
                      {e.descripcion || "Sin comentarios registrados."}
                    </Text>
                    <Group gap={6} mt={4}>
                      <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                        <ClockIcon className="w-3 h-3 text-zinc-500" />
                      </div>
                      <Text size="xs" fw={700} c="dimmed">
                        Por: <span className="text-zinc-300">{e.empleado}</span>
                      </Text>
                    </Group>
                  </Stack>
                </Paper>
              </Timeline.Item>
            );
          })}
        </Timeline>
      )}
    </Stack>
  );
};
