import {
  Timeline,
  Text,
  Loader,
  Center,
  Stack,
  ThemeIcon,
  Badge,
  Paper,
  Group,
} from "@mantine/core";
import {
  ClipboardDocumentListIcon,
  TruckIcon,
  CheckCircleIcon,
  CubeIcon,
} from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import type { RES_OrdenCompraSeguimiento } from "../service/orden-compra.responses";

interface Props {
  eventos: RES_OrdenCompraSeguimiento[];
  loading?: boolean;
  productoNombre?: string;
}

export const TrazabilidadOrdenCompra = ({
  eventos,
  loading,
  productoNombre,
}: Props) => {
  if (loading) {
    return (
      <Center py={60}>
        <Loader size="lg" color="indigo" />
      </Center>
    );
  }

  return (
    <Stack gap="xl" className="animate-fade-in p-2 font-sans">
      {productoNombre && (
        <div className="px-4 py-3 border-l-4 border-indigo-500 bg-zinc-900/50 rounded-r-xl shadow-sm">
          <Text
            size="xs"
            c="dimmed"
            fw={800}
            className="uppercase tracking-widest mb-1"
          >
            Producto:
          </Text>
          <Text size="lg" fw={900} className="text-white tracking-tight">
            {productoNombre}
          </Text>
        </div>
      )}

      {eventos.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-800">
          <CubeIcon className="w-12 h-12 text-zinc-700 mx-auto mb-3 opacity-20" />
          <Text c="dimmed" fs="italic" size="sm" fw={800}>
            No hay eventos de seguimiento aún para este ítem.
          </Text>
        </div>
      ) : (
        <Timeline
          active={eventos.length + 1}
          bulletSize={32}
          lineWidth={2}
          className="px-4"
          color="indigo"
        >
          {eventos.map((evento, idx) => {
            const style = getStatusStyles(evento.estado);
            return (
              <Timeline.Item
                key={evento.id || idx}
                color={style.color}
                bullet={
                  <ThemeIcon
                    size={32}
                    radius="xl"
                    color={style.color}
                    variant="filled"
                    className="shadow-lg transform transition-transform hover:scale-110"
                  >
                    {getStatusIcon(evento.estado)}
                  </ThemeIcon>
                }
                title={
                  <Group justify="space-between" align="center" mb={6}>
                    <Badge
                      color={style.color}
                      variant="light"
                      radius="xl"
                      size="sm"
                      className="font-black border border-current/20 px-3 py-2"
                    >
                      {evento.estado}
                    </Badge>
                    <Text size="11px" c="zinc.5" fw={800} className="font-mono">
                      {dayjs(evento.created_at).format("DD/MM/YYYY HH:mm")}
                    </Text>
                  </Group>
                }
              >
                <Paper
                  p="md"
                  radius="lg"
                  className="bg-zinc-900/40 border border-zinc-800/50 shadow-sm transition-colors hover:bg-zinc-900/60"
                >
                  <Text
                    size="sm"
                    fw={500}
                    c="zinc.100"
                    className="leading-relaxed"
                  >
                    {evento.descripcion}
                  </Text>
                  <div className="mt-3 pt-3 border-t border-zinc-800/50 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                      <Text size="10px" fw={900} className="text-zinc-400">
                        {evento.empleado?.charAt(0).toUpperCase() || "S"}
                      </Text>
                    </div>
                    <Text size="xs" c="zinc.5" fw={500}>
                      Registrado por:
                    </Text>
                    <Text
                      size="xs"
                      fw={700}
                      c="zinc.3"
                      className="italic underline underline-offset-4 decoration-indigo-500/20"
                    >
                      {evento.empleado || "Sistema"}
                    </Text>
                  </div>
                </Paper>
              </Timeline.Item>
            );
          })}
        </Timeline>
      )}
    </Stack>
  );
};

const getStatusStyles = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("pendiente")) return { color: "orange" };
  if (s.includes("recepc")) return { color: "pink" };
  if (s.includes("completad") || s.includes("recibido"))
    return { color: "green" };
  return { color: "gray" };
};

const getStatusIcon = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("pendiente"))
    return <ClipboardDocumentListIcon className="w-4 h-4 text-white" />;
  if (s.includes("recepc")) return <TruckIcon className="w-4 h-4 text-white" />;
  if (s.includes("completad") || s.includes("recibido"))
    return <CheckCircleIcon className="w-4 h-4 text-white" />;
  return <CubeIcon className="w-4 h-4 text-white" />;
};
